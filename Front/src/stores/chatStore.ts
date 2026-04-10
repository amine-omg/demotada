// src/stores/chatStore.ts
import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user'; 
import { useNotificationStore } from './notificationStore'; 

interface Participant {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    photo?: string;
}

interface Conversation {
    _id: string;
    participants: Participant[];
    title?: string;
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
}

interface Message {
    _id: string;
    conversationId: string;
    sender: Participant; 
    content: string;
    readBy: string[]; 
    createdAt: string;
    updatedAt: string;
}

interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    isSendingMessage: boolean;
}

export const useChatStore = defineStore('chat', {
    state: (): ChatState => ({
        conversations: [],
        currentConversation: null,
        messages: [],
        isLoading: false,
        error: null,
        isSendingMessage: false,
    }),

    getters: {
        getSortedConversations: (state) => {
            return [...state.conversations].sort((a, b) =>
                new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            );
        },
        getSortedMessages: (state) => {
            return [...state.messages].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        },
        hasUnreadMessages: (state) => {
            const userStore = useUserStore();
            if (!state.currentConversation || !userStore.user.id) return false;
            // Un message est non lu si l'ID de l'utilisateur n'est pas dans le tableau readBy
            return state.messages.some(msg => !msg.readBy.includes(userStore.user.id!) && msg.sender._id !== userStore.user.id);
        },
    },

    actions: {
        async fetchConversations() {
            this.isLoading = true;
            this.error = null;
            const userStore = useUserStore();
            try {
                const response = await api.get('/api/chat/conversations');
                this.conversations = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement des conversations.';
                console.error('Erreur fetchConversations:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async fetchMessagesInConversation(conversationId: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.get(`/api/chat/conversations/${conversationId}/messages`);
                this.messages = response.data;
                await this.markMessagesAsRead(conversationId);
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement des messages.';
                console.error('Erreur fetchMessagesInConversation:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async createConversation(participantsIds: string[], title?: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.post('/api/chat/conversations', { participantsIds, title });
                const newConversation: Conversation = response.data;
                if (!this.conversations.some(conv => conv._id === newConversation._id)) {
                    this.conversations.push(newConversation);
                }
                this.currentConversation = newConversation; 
                return newConversation;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la création de la conversation.';
                console.error('Erreur createConversation:', err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        async sendMessage(content: string) {
            if (!this.currentConversation) { return; }
            this.isSendingMessage = true;
            this.error = null;
            const userStore = useUserStore(); 
            const notificationStore = useNotificationStore(); 
            try {
                const response = await api.post(`/api/chat/conversations/${this.currentConversation._id}/messages`, { content });
                const newMessage: Message = response.data;
                this.messages.push(newMessage);
                const convIndex = this.conversations.findIndex(c => c._id === this.currentConversation?._id);
                if (convIndex !== -1) {
                    this.conversations[convIndex].lastMessageAt = newMessage.createdAt;
                }
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de l\'envoi du message.';
                console.error('Erreur sendMessage:', err);
            } finally {
                this.isSendingMessage = false;
            }
        },

        async deleteConversation(conversationId: string) {
        const authToken = localStorage.getItem('authToken');
        try {
            await api.delete(`/api/chat/conversations/${conversationId}`);
            this.conversations = this.conversations.filter(c => c._id !== conversationId);
            this.currentConversation = null;
            this.messages = [];
        } catch (error) {
            console.error("Erreur lors de la suppression de la conversation:", error);
            throw error;
        }
    },

    async updateConversation(conversationId: string, data: { title: string }) {
        const authToken = localStorage.getItem('authToken');
        try {
            const response = await api.put(`/api/chat/conversations/${conversationId}`, data);
            this.currentConversation = response.data;
            const index = this.conversations.findIndex(c => c._id === conversationId);
            if (index !== -1) {
                this.conversations[index] = response.data;
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la conversation:", error);
            throw error;
        }
    },

        async markMessagesAsRead(conversationId: string) {
            const userStore = useUserStore();
            if (!userStore.user.id) return;
            try {
                await api.put(`/api/chat/conversations/${conversationId}/read`, {});
                this.messages.forEach(msg => {
                    if (!msg.readBy.includes(userStore.user.id!)) {
                        msg.readBy.push(userStore.user.id!);
                    }
                });
            } catch (error) {
                console.error('Erreur markMessagesAsRead:', error);
            }
        },

        async setCurrentConversation(conversation: Conversation) {
            this.currentConversation = conversation;
            await this.fetchMessagesInConversation(conversation._id);
        },

        resetChatState() {
            this.$reset(); 
        }
    }
});
