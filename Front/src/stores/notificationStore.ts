import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user'; 

interface RecipientSender {
    _id: string;
    nom: string;
    prenom: string;
    email?: string;
    photo?: string;
}

interface Notification {
    _id: string;
    recipient: string | RecipientSender; 
    sender: string | RecipientSender | null; 
    type: 'new_message' | 'formation_approved' | 'formation_rejected' | 'quiz_graded' | 'new_reply_forum' | 'new_sujet_forum' | 'session_update' | 'session_cancellation' | 'enrollment_request' | 'enrollment_approved' | 'enrollment_rejected' | 'system_alert';
    message: string;
    link: string | null;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NotificationState {
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
}

export const useNotificationStore = defineStore('notification', {
    state: (): NotificationState => ({
        notifications: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        getSortedNotifications: (state) => {
            return [...state.notifications].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        },
        getUnreadCount: (state) => {
            return state.notifications.filter(n => !n.read).length;
        },
    },

    actions: {
        async fetchNotifications(readStatus: boolean | null = null) {
            this.isLoading = true;
            this.error = null;
            if (!useUserStore().isAuthenticated) { 
                this.error = "Authentification requise."; 
                this.isLoading = false; 
                return; 
            }

            try {
                const params: { read?: string } = {};
                if (readStatus !== null) {
                    params.read = String(readStatus);
                }
                const response = await api.get('/api/notifications', { params });
                this.notifications = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement des notifications.';
                console.error('Erreur fetchNotifications:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async markAsRead(notificationIds: string[]) {
            try {
                await api.put('/api/notifications/mark-as-read', { notificationIds });
                this.notifications.forEach(n => {
                    if (notificationIds.includes(n._id)) {
                        n.read = true;
                    }
                });
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du marquage des notifications.';
                console.error('Erreur markAsRead:', err);
                throw err;
            }
        },

        async markAllAsRead() {
            try {
                await api.put('/api/notifications/mark-all-as-read', {});
                this.notifications.forEach(n => { n.read = true; });
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du marquage de toutes les notifications.';
                console.error('Erreur markAllAsRead:', err);
                throw err;
            }
        },

        async deleteNotification(notificationId: string) {
            try {
                await api.delete(`/api/notifications/${notificationId}`);
                this.notifications = this.notifications.filter(n => n._id !== notificationId);
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la suppression de la notification.';
                console.error('Erreur deleteNotification:', err);
                throw err;
            }
        },

        resetNotificationState() {
            this.$reset();
        },

        async createSystemNotification(recipientId: string, type: Notification['type'], message: string, link: string | null = null) {
            try {
                await api.post('/api/notifications', {
                    recipient: recipientId,
                    sender: null, 
                    type,
                    message,
                    link
                });
            } catch (error) {
                console.error("Erreur lors de la création d'une notification système:", error);
            }
        },

        async createUserNotification(recipientId: string, senderId: string, type: Notification['type'], message: string, link: string | null = null) {
            try {
                await api.post('/api/notifications', {
                    recipient: recipientId,
                    sender: senderId,
                    type,
                    message,
                    link
                });
            } catch (error) {
                console.error("Erreur lors de la création d'une notification utilisateur:", error);
            }
        }
    }
});