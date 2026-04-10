import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user'; 

interface Author {
    _id: string;
    nom: string;
    prenom: string;
    photo?: string;
    email?: string;
}

interface Sujet {
    _id: string;
    title: string;
    content: string;
    author: Author;
    category: string;
    lastReplyAt: string;
    createdAt: string;
    updatedAt: string;
}

interface Reponse {
    _id: string;
    sujetId: string;
    content: string;
    author: Author; 
    createdAt: string;
    updatedAt: string;
}

interface ForumState {
    sujets: Sujet[];
    currentSujet: Sujet | null;
    reponses: Reponse[];
    isLoading: boolean;
    error: string | null;
    isPosting: boolean; 
}

export const useForumStore = defineStore('forum', {
    state: (): ForumState => ({
        sujets: [],
        currentSujet: null,
        reponses: [],
        isLoading: false,
        error: null,
        isPosting: false,
    }),

    getters: {
        getSortedSujets: (state) => {
            return [...state.sujets].sort((a, b) =>
                new Date(b.lastReplyAt).getTime() - new Date(a.lastReplyAt).getTime()
            );
        },
        getSortedReponses: (state) => {
            return [...state.reponses].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        },
    },

    actions: {
        async fetchAllSujets() {
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');
            if (!authToken) { this.error = "Authentification requise."; this.isLoading = false; return; }
            try {
                const response = await api.get('/api/forum/sujets');
                this.sujets = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement des sujets du forum.';
                console.error('Erreur fetchAllSujets:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async fetchSujetAndReponses(sujetId: string) {
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');
            if (!authToken) { this.error = "Authentification requise."; this.isLoading = false; return; }
            try {
                const sujetResponse = await api.get(`/api/forum/sujets/${sujetId}`);
                this.currentSujet = sujetResponse.data;
                const reponsesResponse = await api.get(`/api/forum/sujets/${sujetId}/reponses`);
                this.reponses = reponsesResponse.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement du sujet et des réponses.';
                console.error('Erreur fetchSujetAndReponses:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async createSujet(title: string, content: string, category: string = 'Discussion générale') {
            this.isPosting = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');
            if (!authToken) { this.error = "Authentification requise."; this.isPosting = false; throw new Error("Authentification requise."); }
            try {
                const response = await api.post('/api/forum/sujets', { title, content, category });
                const newSujet: Sujet = response.data;
                this.sujets.push(newSujet); // Ajouter le nouveau sujet à la liste
                return newSujet;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la création du sujet.';
                console.error('Erreur createSujet:', err);
                throw err;
            } finally {
                this.isPosting = false;
            }
        },

        async createReponse(sujetId: string, content: string) {
            this.isPosting = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');

            if (!authToken) { this.error = "Authentification requise."; this.isPosting = false; throw new Error("Authentification requise."); }

            try {
                const response = await api.post(`/api/forum/sujets/${sujetId}/reponses`, { content });
                const newReponse: Reponse = response.data;
                this.reponses.push(newReponse); 
                const sujetIndex = this.sujets.findIndex(s => s._id === sujetId);
                if (sujetIndex !== -1) {
                    this.sujets[sujetIndex].lastReplyAt = newReponse.createdAt;
                }
                return newReponse;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la publication de la réponse.';
                console.error('Erreur createReponse:', err);
                throw err;
            } finally {
                this.isPosting = false;
            }
        },

        resetForumState() {
            this.$reset(); 
        }
    }
});
