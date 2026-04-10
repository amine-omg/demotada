import { defineStore } from 'pinia';
import api from '/services/api'; 

interface Adresse {
    formattedAddress: string;
    lat: number;
    lng: number;
}

export interface Lieu {
    _id: string;
    nom: string;
    adresse: Adresse;
    capacite: number;
    emailContact?: string;
    nomContact?: string;
    description?: string;
    moyenAcces?: string;
    prixParJour?: number;
    prixParDemiJournee?: number;
    statut: 'Actif' | 'Inactif';
    proprietaireLocaux: boolean;
    isDefault: boolean;
    ecole: string;
    createdAt: string;
    updatedAt: string;
}

interface LieuxState {
    lieux: Lieu[];
    isLoading: boolean;
    error: string | null;
}

export const useLieuxStore = defineStore('lieux', {
    state: (): LieuxState => ({
        lieux: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        activeLieux(state): Lieu[] {
            return state.lieux.filter(lieu => lieu.statut === 'Actif');
        },
        defaultLieu(state): Lieu | undefined {
            return state.lieux.find(lieu => lieu.isDefault);
        }
    },

    actions: {
        async fetchLieux(ecoleId: string) { 
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');

            if (!ecoleId) {
                this.error = "L'identifiant de l'établissement est manquant.";
                this.isLoading = false;
                this.lieux = []; 
                return;
            }

            if (!authToken) {
                this.error = "Authentification requise.";
                this.isLoading = false;
                return;
            }

            try {
                const response = await api.get('/api/lieux', {
                    params: { ecoleId } 
                });
                this.lieux = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement des lieux.';
                console.error('Erreur fetchLieux:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async createLieu(lieuData: Omit<Lieu, '_id' | 'createdAt' | 'updatedAt' | 'isDefault'>) {
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');
            if (!authToken) throw new Error("Authentification requise.");
            try {
                const response = await api.post('/api/lieux', lieuData);
                await this.fetchLieux(lieuData.ecole);   
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la création du lieu.';
                console.error('Erreur createLieu:', err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },
        
        async updateLieu(lieuId: string, updateData: Partial<Lieu>) {
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');
            if (!authToken) throw new Error("Authentification requise.");
            try {
                const response = await api.put(`/api/lieux/${lieuId}`, updateData);
                const index = this.lieux.findIndex(l => l._id === lieuId);
                if (index !== -1) {
                    this.lieux[index] = response.data;
                    this.lieux.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
                }
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la mise à jour du lieu.';
                console.error('Erreur updateLieu:', err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteLieu(lieuId: string) {
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');
            if (!authToken) throw new Error("Authentification requise.");

            try {
                await api.delete(`/api/lieux/${lieuId}`);
                this.lieux = this.lieux.filter(l => l._id !== lieuId);
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la suppression du lieu.';
                console.error('Erreur deleteLieu:', err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        }
    }
});
