<script setup lang="ts">
import { computed, PropType } from 'vue';

interface Participant {
  _id: string;
  nom: string;
  prenom: string;
  photo?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  title?: string;
  lastMessageAt: string;
  unreadCount?: number; // Optionnel
}

const props = defineProps({
  conversations: {
    type: Array as PropType<Conversation[]>,
    required: true,
  },
  currentUserId: {
    type: String,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'select-conversation', conversationId: string): void;
  (e: 'new-conversation'): void;
}>();

const getConversationName = (conversation: Conversation) => {
  if (conversation.title) return conversation.title;
  const otherParticipants = conversation.participants.filter(p => p._id !== props.currentUserId);
  if (otherParticipants.length === 0) return "Note à moi-même";
  return otherParticipants.map(p => p.prenom).join(', ');
};

const getParticipantPhoto = (conversation: Conversation) => {
  const otherParticipant = conversation.participants.find(p => p._id !== props.currentUserId);

  if (otherParticipant && otherParticipant.photo) {
    return otherParticipant.photo;
  }

  return null;
};

const getOtherParticipant = (conversation: Conversation): Participant | undefined => {
  return conversation.participants.find(p => p._id !== props.currentUserId);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

</script>

<template>
  <div class="bg-[#DCD8F4] h-full flex flex-col">
    <div class="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <h1 class="text-3xl font-bold text-[#423B71]">Conversations</h1>
      <button 
        @click="emit('new-conversation')" 
        class="p-2 rounded-full hover:bg-gray-100" 
        title="Nouvelle conversation"
      >
        <i class="fas fa-plus text-gray-600"></i>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="text-center py-4 text-[#464279]">Chargement...</div>
      <div v-else-if="conversations.length === 0" class="text-center p-8 text-gray-500 text-sm">
        <p>Aucune conversation pour le moment.</p>
        <p class="mt-2">Cliquez sur le '+' pour en démarrer une.</p>
      </div>
      <div v-else>
        <div
          v-for="conv in conversations"
          :key="conv._id"
          @click="emit('select-conversation', conv._id)"
          class="flex bg-white items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
        >
         <img v-if="getParticipantPhoto(conv)" :src="getParticipantPhoto(conv)" alt="Avatar" class="w-12 h-12 rounded-full object-cover mr-4">
          <div v-else class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4 flex-shrink-0">
            <i class="fas fa-user text-gray-500 text-xl"></i>
          </div>
         <div class="flex-1 overflow-hidden">
  <h2 class="font-semibold text-[#464279] truncate">{{ getConversationName(conv) }}</h2>

  <div class="flex items-center text-xs text-gray-500 truncate">

    <div v-if="conv.participants.length > 2" class="flex items-center ml-2 text-gray-400">
     
      <span>{{ conv.participants.length }} &nbsp; </span>

      <i class="fas fa-users text-xs mr-1"></i>

      <span class="mx-1">&bull;</span>
    </div>

    <span>Dernier message : {{ formatDate(conv.lastMessageAt) }}</span>
  </div>
</div>
          <span v-if="conv.unreadCount" class="ml-2 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{{ conv.unreadCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>