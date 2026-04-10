import { defineStore } from 'pinia';
import api from '/services/api'; 

export interface CrmConfig {
    _id: string;
    ecole: {
        _id: string;
        nom: string;
    };
    pipelineStages: {
        name: string;
        order: number;
    }[];
    lossReasons: string[];
}

export interface Opportunite {
    _id: string;
    ecole: string;
    nomOpportunite: string;
    currentStage: string;
    apprenants: { _id: string, nom: string, prenom: string }[];
    formation: { _id: string, title: string };
    session: any;
    proprietaire: { _id: string, nom: string, prenom: string };
    financeur?: any;
    typeBusiness: 'OpportunitéEntreprise' | 'OpportunitéParticulier';
    typeInterIntra?: 'Inter' | 'Intra';
    statutOpportunite: 'Indécis' | 'Gagné' | 'Perdu' | 'Annulé';
    lossReason?: string;
    dateCloture?: string;
    valeur: number;
    dateCreation: string;
    modifiedAt: string;
}


interface CrmState {
    config: CrmConfig | null;
    opportunites: Opportunite[];
    selectedOpportunite: Opportunite | null;
    isLoading: boolean;
    error: string | null;
}

export interface Filters {
    search: string;
    gestionnaireId: string | null;
    statut: string | null;
    typeClient: string | null;
}

export const useCrmStore = defineStore('crm', {
    state: (): CrmState => ({
        config: null,
        opportunites: [],
        selectedOpportunite: null,
        isLoading: false,
        error: null,
    }),

    getters: {
        getOpportunitesByStage: (state) => {
            return (stageName: string) => {
                return state.opportunites.filter(op => op.currentStage === stageName);
            };
        }
    },

    actions: {
        async fetchCrmConfig(ecoleId?: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const token = localStorage.getItem('authToken');
                const params = ecoleId ? `?ecoleId=${ecoleId}` : '';
                const response = await api.get(`/api/crm/config${params}`);
                this.config = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || "Erreur lors du chargement de la configuration CRM.";
            } finally {
                this.isLoading = false;
            }
        },

        async updateCrmConfig(configData: { pipelineStages: any[], lossReasons: string[] }) {
            this.isLoading = true;
            this.error = null;
            try {
                const token = localStorage.getItem('authToken');
                const response = await api.put(`/api/crm/config`, configData);
                this.config = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || "Erreur lors de la sauvegarde de la configuration.";
                console.error(this.error);
                throw err; 
            } finally {
                this.isLoading = false;
            }
        },

        async fetchOpportunites(filters: Filters | null = null, ecoleId?: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const token = localStorage.getItem('authToken');
                const params = new URLSearchParams();
                if (filters) {
                }
                if (ecoleId) {
                    params.append('ecoleId', ecoleId);
                }

                const response = await api.get(`/api/crm/opportunites?${params.toString()}`);
                this.opportunites = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || "Erreur lors du chargement des opportunités.";
            } finally {
                this.isLoading = false;
            }
        },
        
        async fetchOpportuniteById(id: string) {
            this.isLoading = true;
            this.error = null;
            this.selectedOpportunite = null;
            try {
                const token = localStorage.getItem('authToken');
                const response = await api.get(`/api/crm/opportunites/${id}`);
                this.selectedOpportunite = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || "Erreur lors du chargement de l'opportunité.";
                console.error(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        async createOpportunite(opportuniteData: Partial<Opportunite>, ecoleId: string | null = null) {
    this.isLoading = true;
    this.error = null;
    try {
      const token = localStorage.getItem('authToken');
      
      let url = `/api/crm/opportunites`;
      if (ecoleId) {
        url += `?ecoleId=${ecoleId}`;
      }

      const response = await api.post(url, opportuniteData);
      
      this.opportunites.unshift(response.data);
      return response.data;
    } catch (err: any) {
      this.error = err.response?.data?.message || "Erreur lors de la création de l'opportunité.";
      console.error(this.error);
      throw err;
    } finally {
      this.isLoading = false;
    }
  },
        
        async updateOpportunite(id: string, updates: Partial<Opportunite>) {
            try {
                const token = localStorage.getItem('authToken');
                const index = this.opportunites.findIndex(op => op._id === id);
                if (index !== -1) {
                    this.opportunites[index] = { ...this.opportunites[index], ...updates };
                }
                const response = await api.put(`/api/crm/opportunites/${id}`, updates, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (index !== -1) {
                    this.opportunites[index] = response.data;
                }
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || "Erreur lors de la mise à jour de l'opportunité.";
                console.error(this.error);
                throw err;
            }
        },

        async deleteOpportunite(id: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const token = localStorage.getItem('authToken');
                await api.delete(`/api/crm/opportunites/${id}`);
                this.opportunites = this.opportunites.filter(op => op._id !== id);
            } catch (err: any) {
                this.error = err.response?.data?.message || "Erreur lors de la suppression de l'opportunité.";
                console.error(this.error);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },
        async linkToCrm(ecoleId: string, crmId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('authToken');
        await api.post(`/api/crm/verify-link`, { ecoleId, crmId });
        const { useUserStore } = await import('./user');
        const userStore = useUserStore();
        await userStore.fetchUserProfile();
      } catch (err: any) {
        this.error = err.response?.data?.message || "La liaison avec le CRM a échoué.";
        console.error(this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    resetCrmState() {
      this.$reset();
    }
    }
});