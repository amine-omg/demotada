import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user';

interface Classroom {
    id: string;
    name: string;
    section?: string;
    ownerId: string;
}

interface ClassroomState {
    classes: Classroom[];
    isLoading: boolean;
    error: string | null;
}

export const useClassroomStore = defineStore('classroom', {
    state: (): ClassroomState => ({
        classes: [],
        isLoading: false,
        error: null,
    }),

    actions: {
        async fetchClasses() {
            const userStore = useUserStore();
            if (!userStore.authToken) {
                this.error = "Utilisateur non authentifié.";
                return;
            }

            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.get('/api/google/classes');
                this.classes = response.data;
            } catch (err) {
                this.error = "Impossible de charger les classes.";
                console.error(err);
            } finally {
                this.isLoading = false;
            }
        },

        async syncClass(classe: Classroom) {
            const userStore = useUserStore();
            if (!userStore.authToken) return;

            try {
                const payload = {
                    g_classroomId: classe.id,
                    name: classe.name,
                    section: classe.section,
                    g_ownerId: classe.ownerId,
                };
                await api.post('/api/google/classes/sync', payload);
                alert(`La classe "${classe.name}" a été synchronisée avec succès !`);
            } catch (error) {
                console.error("Erreur de synchronisation:", error);
                alert("Erreur lors de la synchronisation de la classe.");
            }
        }
    },
});
