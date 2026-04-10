<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import TheHeader from '../components/TheHeader.vue';
import { useChatStore } from '../stores/chatStore';
import { useUserStore } from '../stores/user';

interface SimpleUser {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

const chatStore = useChatStore();
const userStore = useUserStore();

const newMessageContent = ref(''); 
const showNewConversationModal = ref(false); 
const newConversationParticipants = ref<SimpleUser[]>([]);
const newConversationTitle = ref(''); 
const searchParticipantInput = ref(''); 
const searchParticipantResults = ref<SimpleUser[]>([]); 
const searchParticipantError = ref<string | null>(null); 
const conversations = computed(() => chatStore.getSortedConversations);
const messages = computed(() => chatStore.getSortedMessages);
const currentConversation = computed(() => chatStore.currentConversation);
const isLoading = computed(() => chatStore.isLoading);
const isSendingMessage = computed(() => chatStore.isSendingMessage);
const currentUserId = computed(() => userStore.user.id);

const messagesContainer = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(async () => {
  if (currentUserId.value) {
    await chatStore.fetchConversations();
  } else {
    const stopWatchingUser = watch(currentUserId, async (newId) => {
      if (newId) {
        await chatStore.fetchConversations();
        stopWatchingUser(); 
      }
    }, { immediate: true });
  }
});

watch(messages, () => {
  scrollToBottom();
});

watch(currentConversation, () => {
  scrollToBottom();
});

const selectConversation = async (conversation: any) => {
  await chatStore.setCurrentConversation(conversation);
};

const sendMessage = async () => {
  if (newMessageContent.value.trim() && currentConversation.value) {
    try {
      await chatStore.sendMessage(newMessageContent.value.trim());
      newMessageContent.value = ''; 
    } catch (error) {
      alert("Erreur lors de l'envoi du message.");
      console.error("Erreur d'envoi de message:", error);
    }
  }
};

const openNewConversationModal = () => {
  showNewConversationModal.value = true;
  newConversationParticipants.value = [];
  newConversationTitle.value = '';
  searchParticipantInput.value = '';
  searchParticipantResults.value = [];
  searchParticipantError.value = null;
};

const closeNewConversationModal = () => {
  showNewConversationModal.value = false;
};

const searchParticipants = async () => {
  searchParticipantResults.value = [];
  searchParticipantError.value = null;
  if (!searchParticipantInput.value.trim()) {
    searchParticipantError.value = "Veuillez saisir un email pour rechercher.";
    return;
  }
  try {
    const user = await userStore.fetchUserByEmail(searchParticipantInput.value.trim());
    if (user) {
      if (newConversationParticipants.value.some(p => p._id === user._id)) {
        searchParticipantError.value = "Cet utilisateur est déjà ajouté.";
      } else if (user._id === currentUserId.value) {
        searchParticipantError.value = "Vous ne pouvez pas vous ajouter vous-même.";
      } else {
        searchParticipantResults.value = [user];
      }
    } else {
      searchParticipantError.value = "Aucun utilisateur trouvé avec cet email.";
    }
  } catch (error) {
    searchParticipantError.value = "Erreur lors de la recherche.";
    console.error("Erreur recherche participant:", error);
  }
};

const addParticipant = (user: SimpleUser) => {
  if (!newConversationParticipants.value.some(p => p._id === user._id)) {
    newConversationParticipants.value.push(user);
    searchParticipantInput.value = '';
    searchParticipantResults.value = [];
    searchParticipantError.value = null;
  }
};

const removeParticipant = (userId: string) => {
  newConversationParticipants.value = newConversationParticipants.value.filter(p => p._id !== userId);
};

const createNewConversation = async () => {
  if (newConversationParticipants.value.length === 0) {
    searchParticipantError.value = "Veuillez ajouter au moins un participant.";
    return;
  }
  try {
    const participantIds = newConversationParticipants.value.map(p => p._id);
    await chatStore.createConversation(participantIds, newConversationTitle.value.trim() || undefined);
    closeNewConversationModal();
  } catch (error) {
    alert("Erreur lors de la création de la conversation.");
    console.error("Erreur création conversation:", error);
  }
};

const getConversationName = (conversation: any) => {
  if (conversation.title) return conversation.title;
  const otherParticipants = conversation.participants.filter((p: any) => p._id !== currentUserId.value);
  if (otherParticipants.length === 0) return "Moi-même"; 
  return otherParticipants.map((p: any) => `${p.prenom} ${p.nom}`).join(', ');
};

const getParticipantPhoto = (participant: any) => {
  return participant.photo || '/default-avatar.png'; 
};

const isMessageReadByMe = (message: any) => {
  return message.readBy.includes(currentUserId.value);
};
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <TheHeader pageTitle="Chat" :showBackButton="false" />

    <div class="flex flex-1 overflow-hidden">
      <aside class="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">Conversations</h2>
          <button @click="openNewConversationModal" class="p-2 rounded-full hover:bg-gray-100" title="Nouvelle conversation">
            <i class="fas fa-plus text-gray-600"></i>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div v-if="isLoading" class="text-center py-4 text-gray-500">Chargement...</div>
          <div v-else-if="conversations.length === 0" class="text-center py-4 text-gray-500 text-sm">
            Aucune conversation.
          </div>
          <div v-else>
            <div
              v-for="conv in conversations"
              :key="conv._id"
              @click="selectConversation(conv)"
              class="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
              :class="{ 'bg-blue-50': currentConversation && currentConversation._id === conv._id }"
            >
              <img :src="getParticipantPhoto(conv.participants.find((p: any) => p._id !== currentUserId) || conv.participants[0])" alt="Avatar" class="w-10 h-10 rounded-full object-cover mr-3">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-800 truncate">{{ getConversationName(conv) }}</h3>
                <p class="text-xs text-gray-500">Dernier message: {{ new Date(conv.lastMessageAt).toLocaleString() }}</p>
              </div>
              <span v-if="conv.unreadCount > 0" class="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">{{ conv.unreadCount }}</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="flex-1 flex flex-col bg-gray-50">
        <div v-if="!currentConversation" class="flex-1 flex items-center justify-center text-gray-500 text-lg">
          Sélectionnez une conversation pour commencer à discuter.
        </div>
        <div v-else class="flex-1 flex flex-col">
          <div class="p-4 border-b border-gray-200 bg-white flex items-center">
            <img :src="getParticipantPhoto(currentConversation.participants.find((p: any) => p._id !== currentUserId) || currentConversation.participants[0])" alt="Avatar" class="w-10 h-10 rounded-full object-cover mr-3">
            <h2 class="text-xl font-semibold text-gray-800">{{ getConversationName(currentConversation) }}</h2>
          </div>

          <div ref="messagesContainer" class="flex-1 p-4 overflow-y-auto space-y-4">
            <div
              v-for="message in messages"
              :key="message._id"
              class="flex"
              :class="{ 'justify-end': message.sender._id === currentUserId }"
            >
              <div
                class="max-w-xs p-3 rounded-lg shadow-sm"
                :class="{
                  'bg-indigo-500 text-white rounded-br-none': message.sender._id === currentUserId,
                  'bg-gray-200 text-gray-800 rounded-bl-none': message.sender._id !== currentUserId
                }"
              >
                <div v-if="message.sender._id !== currentUserId" class="text-xs font-semibold mb-1">{{ message.sender.prenom }} {{ message.sender.nom }}</div>
                <p class="text-sm">{{ message.content }}</p>
                <div class="text-right text-xs mt-1" :class="{ 'text-indigo-200': message.sender._id === currentUserId, 'text-gray-500': message.sender._id !== currentUserId }">
                  {{ new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  <span v-if="message.sender._id === currentUserId && isMessageReadByMe(message)" class="ml-1 text-xs">✓</span>
                </div>
              </div>
            </div>
            <div v-if="isSendingMessage" class="text-center text-gray-500 text-sm">Envoi...</div>
          </div>

          <div class="p-4 border-t border-gray-200 bg-white flex items-center">
            <input
              type="text"
              v-model="newMessageContent"
              @keyup.enter="sendMessage"
              placeholder="Écrivez votre message..."
              class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-4"
            />
            <button
              @click="sendMessage"
              class="ml-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Envoyer
            </button>
          </div>
        </div>
      </main>
    </div>

    <div v-if="showNewConversationModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300" @click.self="closeNewConversationModal">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300" @click.stop>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Démarrer une nouvelle conversation</h3>
        <div class="space-y-4">
          <div>
            <label for="conv-title" class="block text-sm font-medium text-gray-700 mb-1">Titre de la conversation (optionnel pour 1-à-1)</label>
            <input type="text" id="conv-title" v-model="newConversationTitle" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300">
          </div>

          <div>
            <label for="search-participant" class="block text-sm font-medium text-gray-700 mb-1">Ajouter des participants par email</label>
            <div class="flex">
              <input type="email" id="search-participant" v-model="searchParticipantInput" @keyup.enter="searchParticipants" class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Email de l'utilisateur...">
              <button @click="searchParticipants" class="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700">Rechercher</button>
            </div>
            <p v-if="searchParticipantError" class="text-red-500 text-xs mt-1">{{ searchParticipantError }}</p>
            <div v-if="searchParticipantResults.length > 0" class="mt-2 border border-gray-200 rounded-md bg-gray-50">
              <div v-for="user in searchParticipantResults" :key="user._id" class="flex items-center justify-between p-2 border-b last:border-b-0">
                <span>{{ user.prenom }} {{ user.nom }} ({{ user.email }})</span>
                <button @click="addParticipant(user)" class="text-indigo-600 hover:text-indigo-800 text-sm">Ajouter</button>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-1">Participants ({{ newConversationParticipants.length }})</h4>
            <div v-if="newConversationParticipants.length === 0" class="text-xs text-gray-500">Aucun participant ajouté (vous serez inclus automatiquement).</div>
            <div v-else class="space-y-2">
              <div v-for="participant in newConversationParticipants" :key="participant._id" class="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <span>{{ participant.prenom }} {{ participant.nom }}</span>
                <button @click="removeParticipant(participant._id)" class="text-red-500 hover:text-red-700 text-sm">Retirer</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button @click="closeNewConversationModal" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
          <button @click="createNewConversation" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Démarrer la conversation</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
