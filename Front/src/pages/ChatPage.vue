<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'; 
import TheHeader from '../components/TheHeader.vue';
import { useChatStore } from '../stores/chatStore';
import { useUserStore } from '../stores/user';
import ConversationList from '../components/chat/ConversationList.vue'; 
import ChatWindow from '../components/chat/ChatWindow.vue'; 
import { useRoute, useRouter } from 'vue-router';


interface SimpleUser {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}
const chatStore = useChatStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const activeConversationId = ref<string | null>(null);

const initialTargetUserId = computed(() => route.query.userId as string | null);

const conversations = computed(() => chatStore.getSortedConversations);
const messages = computed(() => chatStore.currentConversation ? chatStore.getSortedMessages : []); 
const currentConversation = computed(() => chatStore.currentConversation);
const currentUserId = computed(() => userStore.user.id); 
const isLoading = computed(() => chatStore.isLoading); 
const isSendingMessage = computed(() => chatStore.isSendingMessage);

watch(() => [userStore.user.id, initialTargetUserId.value], async ([loggedInUserId, urlTargetUserId]) => {
  console.log(`[ChatPage] Watch(loggedInUserId, urlTargetUserId) déclenché. LoggedIn: ${loggedInUserId}, Target: ${urlTargetUserId}`);

  if (!loggedInUserId) {
    console.warn("[ChatPage] Utilisateur non authentifié ou ID non disponible. Réinitialisation des états.");
    chatStore.conversations = []; 
    chatStore.currentConversation = null; 
    activeConversationId.value = null; 
    return;
  }

  await chatStore.fetchConversations();
  console.log('[ChatPage] Conversations de l\'utilisateur chargées.');

  if (urlTargetUserId) {
    console.log(`[ChatPage] ID cible dans l'URL: ${urlTargetUserId}. Tentative de démarrage de conversation.`);
    await tryToStartConversationWithUser(urlTargetUserId);
  } else if (!activeConversationId.value && !chatStore.currentConversation) {
    console.log("[ChatPage] Pas d'ID cible dans l'URL et pas de conversation active. Affichage de la liste générale.");
    activeConversationId.value = null;
    chatStore.currentConversation = null;
  }
}, { immediate: true }); 


onMounted(() => {
  console.log("[ChatPage] Composant ChatPage monté.");
});


const tryToStartConversationWithUser = async (userId: string) => {
  
  const existingConv = conversations.value.find(conv => {
    const participantsIds = conv.participants.map(p => p._id);
    return participantsIds.includes(userId) && participantsIds.includes(userStore.user.id!) && conv.participants.length === 2;
  });

  if (existingConv) {
    console.log(`[ChatPage] Conversation existante trouvée avec ${userId}. ID: ${existingConv._id}`);
    await handleSelectConversation(existingConv._id);
  } else {
    console.log(`[ChatPage] Aucune conversation directe existante avec ${userId}. Préparation à la création.`);
    await prepareNewConversationWithUser(userId);
  }
};

const prepareNewConversationWithUser = async (userId: string) => {
  try {
    const userToChatWith = await userStore.fetchUserById(userId);
    if (userToChatWith) {
      newConversationParticipants.value = [{ 
        _id: userToChatWith._id, 
        nom: userToChatWith.nom, 
        prenom: userToChatWith.prenom, 
        email: userToChatWith.email 
      }];
      newConversationTitle.value = `Discussion avec ${userToChatWith.prenom} ${userToChatWith.nom}`;
      searchParticipantInput.value = '';
      searchParticipantResults.value = [];
      searchParticipantError.value = null;
      showNewConversationModal.value = true;
    } else {
      console.error(`[ChatPage] Utilisateur cible ID ${userId} non trouvé lors de prepareNewConversationWithUser.`);
      alert("Impossible de trouver l'utilisateur cible pour démarrer une conversation.");
      router.replace({ query: {} }); 
    }
  } catch (error) {
    console.error(`[ChatPage] Erreur lors de la préparation de la nouvelle conversation avec ${userId}:`, error);
    alert("Erreur lors de la préparation de la conversation.");
    router.replace({ query: {} });
  }
};

const handleSelectConversation = async (conversationId: string) => {
  await chatStore.fetchMessagesInConversation(conversationId);
  const selectedConv = conversations.value.find(c => c._id === conversationId);
  if (selectedConv) {
    chatStore.setCurrentConversation(selectedConv);
    activeConversationId.value = conversationId;
    router.replace({ query: { conversationId: conversationId } }); 
  }
};

const handleGoBack = () => {
  console.log("[ChatPage] handleGoBack appelé.");
  activeConversationId.value = null;
  chatStore.currentConversation = null;
  router.replace({ query: {} });
};

const handleSendMessage = async (content: string) => {
  await chatStore.sendMessage(content);
};

const showNewConversationModal = ref(false);
const newConversationParticipants = ref<SimpleUser[]>([]);
const newConversationTitle = ref('');
const searchParticipantInput = ref('');
const searchParticipantResults = ref<SimpleUser[]>([]);
const searchParticipantError = ref<string | null>(null);

const handleNewConversation = () => {
  searchParticipantInput.value = '';
  searchParticipantResults.value = [];
  searchParticipantError.value = null;
  newConversationParticipants.value = [];
  newConversationTitle.value = '';

  if (currentConversation.value) {
    newConversationParticipants.value = [...currentConversation.value.participants.filter(p => p._id !== currentUserId.value)];
    newConversationTitle.value = currentConversation.value.title || '';
  }

  showNewConversationModal.value = true;
};

const closeNewConversationModal = () => {
  console.log("[ChatPage] closeNewConversationModal appelé.");
  showNewConversationModal.value = false;
  handleGoBack();
};

const handleUpdateTitle = async (newTitle: string) => {
  if (!currentConversation.value) return;
  await chatStore.updateConversation(currentConversation.value._id, { title: newTitle });
};

const handleDeleteConversation = async () => {
  if (!currentConversation.value) return;

  if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible et supprimera tous les messages.')) {
    try {
      await chatStore.deleteConversation(currentConversation.value._id);
      activeConversationId.value = null;
      alert('Conversation supprimée.');
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  }
};


const searchParticipants = async () => {
  searchParticipantResults.value = [];
  searchParticipantError.value = null;
  if (!searchParticipantInput.value.trim()) return;
  
  try {
    const user = await userStore.fetchUserByEmail(searchParticipantInput.value.trim());
    if (user) {
      if (newConversationParticipants.value.some(p => p._id === user._id) || user._id === currentUserId.value) {
        searchParticipantError.value = "Utilisateur déjà ajouté ou c'est vous-même.";
      } else {
        searchParticipantResults.value = [user];
      }
    } else {
      searchParticipantError.value = "Aucun utilisateur trouvé.";
    }
  } catch (error) {
    searchParticipantError.value = "Erreur lors de la recherche.";
  }
};

const addParticipant = (user: SimpleUser) => {
  if (!newConversationParticipants.value.some(p => p._id === user._id)) {
    newConversationParticipants.value.push(user);
    searchParticipantInput.value = '';
    searchParticipantResults.value = searchParticipantResults.value.filter(u => u._id !== user._id);
    searchParticipantError.value = null;
  }
};

const removeParticipant = (userId: string) => {
  newConversationParticipants.value = newConversationParticipants.value.filter(p => p._id !== userId);
};

const createNewConversation = async () => {
  if (!userStore.user.id) {
    alert("Vous devez être connecté pour créer une conversation.");
    return;
  }

  if (!newConversationParticipants.value.some(p => p._id === userStore.user.id)) {
    const currentUserDetails = userStore.user;
    if (currentUserDetails && currentUserDetails.id) {
        newConversationParticipants.value.push({
            _id: currentUserDetails.id,
            nom: currentUserDetails.nom,
            prenom: currentUserDetails.prenom,
            email: currentUserDetails.email
        });
    }
  }

  if (newConversationParticipants.value.length === 0) {
    searchParticipantError.value = "Veuillez ajouter au moins un participant (vous êtes inclus automatiquement).";
    return;
  }
  
  try {
    const participantIds = newConversationParticipants.value.map(p => p._id);
    const newConv = await chatStore.createConversation(participantIds, newConversationTitle.value.trim() || undefined);
    
    closeNewConversationModal(); 
    await handleSelectConversation(newConv._id);
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    alert("Erreur lors de la création de la conversation.");
  }
};


</script>

<template>
  <div class="flex flex-col h-full bg-[#DCD8F4]">
    <TheHeader pageTitle="Messages" :showBackButton="false" />

    <div class="flex-1 overflow-hidden p-2 md:p-8">
      <ChatWindow
        v-if="currentConversation"
        :conversation="currentConversation"
        :messages="messages"
        :current-user-id="currentUserId"
        :is-sending-message="isSendingMessage"
        @go-back="handleGoBack"
        @send-message="handleSendMessage"
        @add-participant="handleNewConversation"
        @update-title="handleUpdateTitle"
        @delete-conversation="handleDeleteConversation"
      />
      
      <div v-else-if="initialTargetUserId && isLoading" class="flex items-center justify-center h-full text-gray-500">
        Chargement de la conversation...
      </div>

      <div v-else-if="initialTargetUserId && !currentConversation" class="flex flex-col items-center justify-center h-full p-4 text-center text-gray-600">
        {{ console.log('[ChatPage DEBUG] Rendering new conversation prompt. initialTargetUserId:', initialTargetUserId.value, 'currentConversation:', currentConversation.value) }}
        <p class="text-lg font-semibold mb-2">Démarrer une conversation</p>
        <p>Impossible de trouver une conversation existante avec l'utilisateur spécifié.</p>
        <button @click="handleNewConversation" class="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
          Créer une nouvelle conversation
        </button>
      </div>

      <ConversationList
        v-else
        :conversations="conversations"
        :current-user-id="currentUserId"
        :is-loading="isLoading"
        @select-conversation="handleSelectConversation"
        @new-conversation="handleNewConversation"
      />
    </div>

    <div v-if="showNewConversationModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeNewConversationModal">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300" @click.stop>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Démarrer une nouvelle conversation</h3>
        <div class="space-y-4">
          <div>
            <label for="conv-title" class="block text-sm font-medium text-gray-700 mb-1">Titre (optionnel)</label>
            <input type="text" id="conv-title" v-model="newConversationTitle" class="input-field">
          </div>
          <div>
            <label for="search-participant" class="block text-sm font-medium text-gray-700 mb-1">Ajouter des participants</label>
            <div class="flex">
              <input type="email" id="search-participant" v-model="searchParticipantInput" @keyup.enter="searchParticipants" class="input-field rounded-r-none" placeholder="Email.">
              <button @click="searchParticipants" class="btn-primary rounded-l-none">Rechercher</button>
            </div>
            <p v-if="searchParticipantError" class="text-red-500 text-xs mt-1">{{ searchParticipantError }}</p>
            <div v-if="searchParticipantResults.length > 0" class="mt-2 border border-gray-200 rounded-md bg-gray-50">
              <div v-for="user in searchParticipantResults" :key="user._id" class="flex items-center justify-between p-2 border-b last:border-b-0">
                <span>{{ user.prenom }} {{ user.nom }} ({{ user.email }})</span>
                <button @click="addParticipant(user)" class="btn-text text-indigo-600">Ajouter</button>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-1">Participants ({{ newConversationParticipants.length }})</h4>
            <div v-if="newConversationParticipants.length === 0" class="text-xs text-gray-500">Vous serez inclus automatiquement.</div>
            <div v-else class="space-y-2">
              <div v-for="participant in newConversationParticipants" :key="participant._id" class="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <span>{{ participant.prenom }} {{ participant.nom }}</span>
                <button @click="removeParticipant(participant._id)" class="text-red-500 text-sm">Retirer</button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="closeNewConversationModal" class="btn-secondary">Annuler</button>
          <button v-if="activeConversationId" @click="handleAddParticipant" class="btn-primary">Ajouter</button>
          <button v-else @click="createNewConversation" class="btn-primary">Démarrer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent;
}
.btn-primary {
  @apply bg-[#B0E9DF] text-black font-medium px-4 py-2 rounded-md;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md;
}
.btn-text {
  @apply text-sm font-medium hover:underline;
}

</style>