import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user.ts';

interface PopulatedCategory {
  _id: string;
  name: string; 
}

interface CreatedByUser {
  _id: string;
  nom: string;
  prenom: string;
}

interface Formation {
  _id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
  createdBy: CreatedByUser;
  category: string | PopulatedCategory | null;
  domain: string; 
  tags: string[]; 
  validationStatus: string; 
}

interface FormationsState {
  formations: Formation[];
  currentFormation: Formation | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string; 
    sortBy: string;
    categoryId: string | null;
  };
  showArchived: boolean;
}
// et pk pas
export const useFormationsStore = defineStore('formations', {
  state: (): FormationsState => ({
    formations: [],
    isLoading: false,
    currentFormation: null,
    error: null,
    filters: {
      search: '',
      status: '',
      sortBy: 'name',
      categoryId: null,
    },
    showArchived: false,
  }),

  getters: {
    formationsAfterSearch: (state) => {
      let formations = state.showArchived
        ? state.formations
        : state.formations.filter(f => f.status !== 'disabled');

      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase();
        formations = formations.filter(f =>
          f.title.toLowerCase().includes(searchTerm)
        );
      }
      return formations;
    },

    uncategorizedFormations(state) {
        return this.formationsAfterSearch.filter(f => !f.category);
    },
    getFormationsByCategoryId(state) {
        return (categoryId: string) => {
            return this.formationsAfterSearch.filter(f => {
                if (typeof f.category === 'object' && f.category !== null && '_id' in f.category) {
                    return f.category._id === categoryId;
                }
                return f.category === categoryId;
            });
        }
    },
    visibleFormations: (state) => {
      if (state.showArchived) {
        return state.formations; // Si on veut voir les archives, on retourne tout
      }
      // Sinon, on retourne uniquement les formations qui ne sont PAS archivées
      return state.formations.filter(f => f.status !== 'disabled');
    },

    
  },

  actions: {
    async fetchFormations(context: {
  ecoleId?: string | null;
  createdByUserId?: string | null;
  validationStatus?: string | null;
  domain?: string | null;
  tags?: string[] | null;
  publicOnly?: boolean;
} = {}) {
  this.isLoading = true;
  this.error = null;

  if (!useUserStore().isAuthenticated && !context.publicOnly) {
    this.error = "Authentification requise pour charger les formations.";
    this.isLoading = false;
    return;
  }

  try {
    const params: any = {
      ecoleId: context.ecoleId,
      createdBy: context.createdByUserId,
      validationStatus: context.validationStatus,
      domain: context.domain,
      tags: context.tags?.join(','),
      publicOnly: context.publicOnly,
    };
    
    const response = await api.get('/api/formations', { params });
    this.formations = response.data;
    
  } catch (err: any) {
    this.error = err.response?.data?.message || 'Erreur lors du chargement des formations.';
    console.error('Erreur de chargement des formations:', err);
  } finally {
    this.isLoading = false;
  }
},
       async createFormation(formationData: { 
        title: string; description: string; 
        category?: string | null; 
        ecole?: string | null;
        domain?: string; tags?: string[] }) {
         this.isLoading = true;
         this.error = null;
         try {
           const response = await api.post('/api/formations', formationData);
           this.formations.push(response.data);
           return response.data;
         } catch (err: any) {
           this.error = err.response?.data?.message || 'Erreur lors de la création de la formation.';
           console.error('Erreur de création de formation:', err);
           throw err;
         } finally {
           this.isLoading = false;
         }
       },

    async updateFormationStatus(formationId: string, newStatus: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await api.put(
          `/api/formations/${formationId}`,
          { status: newStatus });

        const updatedFormation = response.data;
        const index = this.formations.findIndex(f => f._id === updatedFormation._id);
        if (index !== -1) {
          this.formations[index] = updatedFormation;
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la mise à jour du statut de la formation.';
        console.error('Erreur updateFormationStatus:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    toggleArchivedView() {
      this.showArchived = !this.showArchived;
    },

    async updateFormationValidationStatus(formationId: string, newValidationStatus: 'pending' | 'approved' | 'rejected') {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.error = "Authentification requise pour modifier le statut de validation.";
        this.isLoading = false;
        throw new Error("Authentification requise.");
      }

      try {
        const response = await api.put(
          `/api/formations/${formationId}`,
          { validationStatus: newValidationStatus });
        const updatedFormation = response.data;
        const index = this.formations.findIndex(f => f._id === updatedFormation._id);
        if (index !== -1) {
          this.formations[index] = updatedFormation;
        }
        return updatedFormation; 
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la mise à jour du statut de validation.';
        console.error('Erreur updateFormationValidationStatus:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async assignCategoryToFormation(formationId: string, categoryId: string | null) {
          this.isLoading = true;
          this.error = null;
          try {
            const response = await api.put(
              `/api/formations/${formationId}`,
              { category: categoryId });
            const updatedFormation = response.data;
            const index = this.formations.findIndex(f => f._id === updatedFormation._id);
            if (index !== -1) {
              this.formations[index] = updatedFormation;
            }
          } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors de l\'assignation de la catégorie.';
            console.error('Erreur assignation catégorie:', err);
            throw err;
          } finally {
            this.isLoading = false;
          }
        },

      async importScormFormation(file: File): Promise<Formation | null> {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.error = "Authentification requise pour importer une formation.";
        this.isLoading = false;
        return null;
      }
      const formData = new FormData();
      formData.append('scormfile', file);
      try {
        const response = await api.post('/api/scorm/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${authToken}`
          }
        });
        console.log('Réponse de l\'import :', response.data);
        alert('Package SCORM uploadé avec succès ! Le traitement côté serveur est en cours.');
        return null;
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de l'importation du package SCORM.";
        console.error('Erreur importScormFormation:', err);
        throw err; 
      } finally {
        this.isLoading = false;
      }
    },

    async deleteFormation(formationId: string) {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.error = "Authentification requise.";
        this.isLoading = false;
        throw new Error("Authentification requise.");
      }
      try {
        await api.delete(`/api/formations/${formationId}`);
        this.formations = this.formations.filter(f => f._id !== formationId);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression de la formation.';
        console.error('Erreur deleteFormation:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async savePositioningTest(formationId: string, quizData: any) {
      this.isLoading = true;
      try {
        const response = await api.post(`/api/formations/${formationId}/positioning-test`, quizData);
        if (this.currentFormation && this.currentFormation._id === formationId) {
          this.currentFormation.positioningQuizId = response.data._id;
        }
        return response.data;
      } catch (err: any) {
        this.error = "Erreur lors de la sauvegarde du test.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPositioningTest(formationId: string) {
      try {
        const response = await api.get(`/api/formations/${formationId}/positioning-test`);
        return response.data;
      } catch (err) {
        console.error("Pas de test trouvé");
        return null;
      }
    },

    async fetchFormationById(id: string): Promise<Formation | null> {
        console.log(`[ÉTAPE 4] Le store 'formations.ts' a reçu l'ordre de fetch l'ID : ${id}`);
      this.isLoading = true;
      this.error = null;
      this.currentFormation = null; 
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        return null;
      }
      try {
        const response = await api.get(`/api/formations/${id}`);
            console.log("[ÉTAPE 5] Données reçues de l'API :", response.data);
        this.currentFormation = response.data;
        return this.currentFormation;
      } catch (err: any) {
        console.error("ERREUR dans fetchFormationById :", err); 
        this.error = err.response?.data?.message || 'Erreur lors du chargement de la formation.';
          throw err;
      } finally {
        this.isLoading = false;
      }
    },

  
  },
});

