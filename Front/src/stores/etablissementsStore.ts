// src/stores/etablissementsStore.ts
import { defineStore } from 'pinia';
import api from '/services/api';
import { useUserStore } from './user'; 

// Interface décrivant la structure d'un établissement
export interface Etablissement {
  _id: string;
  nom: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
  siret?: string;
  logoUrl?: string;
  website?: string; // <-- AJOUTER CETTE LIGNE
  description?: string;
  estCertificateur?: boolean;
  statut?: 'actif' | 'inactif' | 'en_attente_de_validation';
  createdAt?: string;
  updatedAt?: string;
}

interface FormationSimplifiee {
  _id: string;
  title: string;
  status: string;
}

export interface EtablissementSimple { // NOUVELLE INTERFACE
  _id: string;
  nom: string;
}


// NOUVELLE INTERFACE pour les formations externes
interface FormationExterne {
  intitule_formation: string;
  nom_of: string;
  code_rncp: string;
  objectif_formation: string;
  contenu_formation: string;
  points_forts: string;
  siret: string;
}


export const useEtablissementsStore = defineStore('etablissements', {
  state: () => ({
    etablissements: [] as Etablissement[],
    mesEtablissements: [] as Etablissement[],
    currentEtablissement: null as Etablissement | null,
    formationsForCurrentEtablissement: [] as FormationSimplifiee[],
    externalFormations: [] as FormationExterne[],
    isLoading: false,
    // Nouvel état de chargement spécifique à la recherche externe
    isExternalLoading: false,
    adminSchoolList: [] as EtablissementSimple[], // NOUVEAU STATE
      }),
  actions: {
    // --- ACTIONS AVEC AUTHENTIFICATION MANUELLE ---

  async fetchEtablissements() {
      this.isLoading = true;
      try {
        const response = await api.get('/api/etablissements');
        this.etablissements = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des établissements:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMesEtablissements() {
      this.isLoading = true;
      try {
        const response = await api.get('/api/ecoles/me');
        this.mesEtablissements = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération de 'mes' établissements:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEtablissementById(id: string) {
      this.isLoading = true;
      try {
        const response = await api.get(`/api/ecoles/${id}`);
        this.currentEtablissement = response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération de l'établissement ${id}:`, error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAdminSchoolList() {
      this.isLoading = true;
      try {
        const response = await api.get('/api/ecoles/search-list');
        this.adminSchoolList = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération de la liste des écoles pour l'admin:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchFormationsForEtablissement(ecoleId: string) {
      this.isLoading = true;
      try {
        const response = await api.get(`/api/ecoles/${ecoleId}/formations`);
        this.formationsForCurrentEtablissement = response.data;
      } catch (error) {
        this.formationsForCurrentEtablissement = [];
        console.error("Erreur lors de la récupération des formations de l'établissement:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async createEtablissement(data: { nom: string }): Promise<Etablissement> {
      this.isLoading = true;
      try {
        const response = await api.post<Etablissement>('/api/ecoles', data);
        this.etablissements.push(response.data);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la création de l'établissement:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createMyEtablissement(data: { nom: string }) {
      this.isLoading = true;
      try {
        const response = await api.post('/api/ecoles', data);
        const userStore = useUserStore();
        await userStore.fetchUserProfile();
        this.currentEtablissement = response.data;
      } catch (error) {
        console.error("Erreur lors de la création de l'établissement:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateEtablissement(id: string, data: Partial<Etablissement>) {
      this.isLoading = true;
      try {
        const response = await api.put<Etablissement>(`/api/ecoles/${id}`, data);
        this.currentEtablissement = response.data;
        const index = this.etablissements.findIndex(e => e._id === id);
        if (index !== -1) this.etablissements[index] = response.data;
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'établissement:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async detachFormationFromEtablissement(formationId: string) {
      this.isLoading = true;
      try {
        await api.put(`/api/formations/${formationId}`, { ecole: null });
        this.formationsForCurrentEtablissement = this.formationsForCurrentEtablissement.filter(
          f => f._id !== formationId
        );
      } catch (error) {
        console.error("Erreur lors du détachement de la formation:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchFormationsBySiret(siret: string) {
      this.isExternalLoading = true;
      this.externalFormations = [];
      try {
        // On retire aussi l'objet 'headers' qui est maintenant inutile.
        const response = await api.get(`/api/ecoles/external-formations/${siret}`);
        this.externalFormations = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des formations externes par SIRET:", error);
        throw error;
      } finally {
        this.isExternalLoading = false;
      }
    },
  }
});