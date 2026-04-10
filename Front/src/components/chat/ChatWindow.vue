<script setup lang="ts">
import { ref, watch, nextTick, computed, PropType } from 'vue';

interface Participant { _id: string; nom: string; prenom: string; photo?: string; }
interface Conversation { _id: string; participants: Participant[]; title?: string; }
interface Message { _id: string; sender: Participant; content: string; createdAt: string; readBy: string[]; }

const props = defineProps({
  conversation: { type: Object as PropType<Conversation>, required: true },
  messages: { type: Array as PropType<Message[]>, required: true },
  currentUserId: { type: String, required: true },
  isSendingMessage: { type: Boolean, default: false },
});


const isEditingTitle = ref(false);
const editedTitle = ref(props.conversation.title || '');

const emit = defineEmits<{
  (e: 'go-back'): void;
  (e: 'send-message', content: string): void;
(e: 'update-title', newTitle: string): void; 
  (e: 'add-participant'): void;

  (e: 'delete-conversation'): void; 
}>();

const newMessageContent = ref('');
const messagesContainer = ref<HTMLElement | null>(null);


const otherParticipant = computed(() => {
  return props.conversation.participants.find(p => p._id !== props.currentUserId);
});

const getConversationName = computed(() => {
  if (props.conversation.title) return props.conversation.title;
  return otherParticipant.value ? `${otherParticipant.value.prenom} ${otherParticipant.value.nom}` : "Note à moi-même";
});

const getParticipantPhoto = computed(() => {
  return otherParticipant.value?.photo;
});


const handleSendMessage = () => {
  console.log('1. Clic détecté dans ChatWindow'); 
  if (newMessageContent.value.trim()) {
    console.log('2. Émission de l\'événement "send-message" vers la page parente...'); 
    emit('send-message', newMessageContent.value.trim());
    newMessageContent.value = '';
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};



watch(() => props.messages, scrollToBottom, { deep: true, immediate: true });

const startEditingTitle = () => {
  editedTitle.value = props.conversation.title || getConversationName.value;
  isEditingTitle.value = true;
};

const saveTitle = () => {
  if (editedTitle.value.trim() && editedTitle.value.trim() !== (props.conversation.title || getConversationName.value)) {
    emit('update-title', editedTitle.value.trim());
  }
  isEditingTitle.value = false;
};
</script>

<template>
  <div class="h-full grid grid-rows-[auto,1fr,auto] bg-[#F1F0FB]">
    <div class="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
      <div class="flex items-center overflow-hidden">
        <button @click="emit('go-back')" class="mr-4 text-gray-600 p-2 -ml-2" aria-label="Retour à la liste des conversations">
         <i class="fas fa-chevron-left"></i>
        </button>
        <h2 v-if="!isEditingTitle" class="text-xl font-semibold text-gray-800 truncate">{{ getConversationName }}</h2>
        <input 
          v-else 
          type="text" 
          v-model="editedTitle" 
          @keyup.enter="saveTitle" 
          @blur="saveTitle" 
          class="text-xl font-semibold bg-gray-100 border-gray-300 rounded px-2"
          v-focus />
      </div>
      

      <div class="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <button v-if="conversation.participants.length > 1" @click="startEditingTitle" class="p-2 rounded-full hover:bg-gray-100" title="Modifier le titre" aria-label="Modifier le titre de la conversation">
            <i class="fas fa-pencil-alt text-gray-600 text-sm"></i>
        </button>
      <button @click="emit('add-participant')" class="p-2 rounded-full hover:bg-gray-100 ..." title="Ajouter des participants" aria-label="Ajouter des participants">
        <i class="fas fa-user-plus text-gray-600"></i>
      </button>

        <button @click="emit('delete-conversation')" class="p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600" title="Supprimer la conversation" aria-label="Supprimer la conversation">
          <i class="fas fa-trash-alt"></i>
        </button>
    </div>
    </div>

    <div ref="messagesContainer" class="overflow-y-auto p-4 space-y-4 min-h-0">
      <div
        v-for="message in messages"
        :key="message._id"
        class="flex"
        :class="{ 'justify-end': message.sender._id === currentUserId }"
      >
        <div
          class="max-w-xs lg:max-w-md p-3 rounded-lg shadow-sm"
          :class="{
            'bg-[#B2E9E1] text-[#464279] rounded-br-none': message.sender._id === currentUserId,
            'bg-white text-gray-800 rounded-bl-none border': message.sender._id !== currentUserId
          }"
        >
          <div v-if="message.sender._id !== currentUserId" class="text-xs font-semibold textg-[#876EC8] mb-1">
            {{ message.sender.prenom }} {{ message.sender.nom }}
          </div>
          <p class="text-sm break-words">{{ message.content }}</p>
          <div class="text-right text-xs mt-1" :class="{ 'text-indigo-200': message.sender._id === currentUserId, 'text-gray-500': message.sender._id !== currentUserId }">
            {{ new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>
      </div>
      <div v-if="isSendingMessage" class="text-center text-gray-500 text-sm">Envoi...</div>
    </div>

    <div class="p-4 border-t border-gray-200 bg-white flex items-center">
      <input
        type="text"
        v-model="newMessageContent"
        @keyup.enter="handleSendMessage"
        placeholder="Écrivez votre message"
        class="flex-1 rounded border-gray-300 shadow-sm focus:border-[#433C74] focus:ring focus:ring-[#FE8B7D] focus:ring-opacity-50 py-2 px-4"
      />
      <button
        @click="handleSendMessage"
        class="ml-3 bg-[#876EC8] hover:bg-[#FE8B7D] text-white font-bold w-12 h-12 rounded transition duration-300 ease-in-out flex items-center justify-center"
        aria-label="Envoyer le message"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>