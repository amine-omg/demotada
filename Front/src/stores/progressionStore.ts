import { defineStore } from 'pinia';
import api from '/services/api'; 



interface Progression {
  _id: string;
  user: { _id: string; nom: string; prenom: string; email: string };
  session: string;
  contentId: string;
  contentType: string;
  status: 'bloque' | 'en_cours' | 'termine' | 'valide';
}

export interface ModuleProgression {
  _id: string;
  contentId: string; 
  contentType: 'Module';
  status: 'bloque' | 'en_cours' | 'termine' | 'valide';
}
export interface ChapterProgression {
  _id: string;
  contentId: string; 
  contentType: 'Chapter';
  parentModule: string;
  status: 'bloque' | 'en_cours' | 'termine' | 'valide';
}

export interface ProgressionContent {
  _id: string;
  user: string;
  session: string;
  module: string;
  chapter: string;
  content: string; 
  status: 'bloque' | 'en_cours' | 'termine' | 'valide';
}

export interface ProgressionDetail {
  _id: string;
  user: string;
  session: string;
  module: string;
  chapter: string;
  status: 'bloque' | 'en_cours' | 'termine' | 'valide';
}

interface ProgressionState {
  progressions: Progression[];
  detailedProgressions: ProgressionDetail[]; 
  contentProgressions: ProgressionContent[];
  moduleProgressions: ModuleProgression[];
  chapterProgressions: ChapterProgression[]; 
  isLoading: boolean;
  error: string | null;
}



export const useProgressionStore = defineStore('progression', {
  state: (): ProgressionState => ({
    progressions: [],
    detailedProgressions: [], 
    contentProgressions: [],
    moduleProgressions: [],
    chapterProgressions: [],
    isLoading: false,
    error: null,
  }),

actions: {
   async fetchProgressionForSession(sessionId: string) {
  this.isLoading = true;
  this.error = null;
  try {
    const response = await api.get(`/api/progression/session/${sessionId}`);
    
    // On transforme les données pour que 'content' soit lisible en 'contentId' par le front
    this.progressions = response.data.map((p: any) => ({
      ...p,
      contentId: p.contentId || (p.content && typeof p.content === 'object' ? p.content._id : p.content)
    }));
    
  } catch (err: any) {
    this.error = "Erreur de chargement.";
    console.error("Erreur fetchProgressionForSession:", err);
  } finally {
    this.isLoading = false;
  }
},

   async completeContent(sessionId: string, contentId: string, contentType: string, score?: number, totalScore?: number) {
    this.isLoading = true;
    this.error = null;
    try {
        // ON ENVOIE ENFIN LE SCORE AU BACKEND !
        await api.post('/api/progression/complete', { 
            sessionId, 
            contentId, 
            contentType, 
            score, 
            totalScore 
        });
        
        await this.fetchProgressionForSession(sessionId);
    } catch (err: any) {
        this.error = "Erreur lors de la mise à jour de la progression.";
        console.error("Erreur completeContent:", err);
        throw err;
    } finally {
        this.isLoading = false;
    }
},

    async fetchActivityProgression(sessionId: string, chapterId: string) {
    this.isLoading = true;
    try {
        const response = await api.get(`/api/progression/chapter/${chapterId}/activities`, {
            params: { sessionId }
        });
        // On fusionne les nouvelles progressions avec celles déjà chargées
        const existingIds = new Set(this.progressions.map(p => p.contentId));
        const newProgressions = response.data.filter((p: Progression) => !existingIds.has(p.contentId));
        this.progressions.push(...newProgressions);
    } catch (err) {
        // ... gestion d'erreur
    } finally {
        this.isLoading = false;
    }
},

    async startModuleProgression(sessionId: string, moduleId: string) {
      this.isLoading = true;
      try {
        await api.post(
          `/api/progression/module/start`,
          { sessionId, moduleId }
        );
        await this.fetchDetailedProgression(sessionId, moduleId);
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de l'initialisation du module.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetailedProgression(sessionId: string, moduleId: string) {
      this.isLoading = true;
      try {
        const response = await api.get(
          `/api/progression/details`,
          { params: { sessionId, moduleId } }
        );
        this.detailedProgressions = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement de la progression détaillée.';
      } finally {
        this.isLoading = false;
      }
    },

    async startChapterProgression(sessionId: string, moduleId: string, chapterId: string) {
      this.isLoading = true;
      try {
        await api.post(
          `/api/progression/chapter/start`,
          { sessionId, moduleId, chapterId }
        );
        await this.fetchChapterProgression(sessionId, chapterId);
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de l'initialisation du chapitre.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchChapterProgression(sessionId: string, chapterId: string) {
      this.isLoading = true;
      try {
        const response = await api.get(
          `/api/progression/chapter-details`,
          { params: { sessionId, chapterId } }
        );
        this.contentProgressions = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement de la progression du chapitre.';
      } finally {
        this.isLoading = false;
      }
    },
 
    async fetchModuleProgressionForSession(sessionId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await api.get(`/api/progression/session/${sessionId}`);
        this.moduleProgressions = res.data;
      } catch (err: any) {
        this.error = err.response?.data?.message;
      } finally {
        this.isLoading = false;
      }
    },

async getOrInitializeActivityProgression(sessionId: string, chapterId: string) {
        this.isLoading = true;
        this.error = null;
        const authToken = localStorage.getItem('authToken');
        try {
            const response = await api.post(
                `/api/progression/session/${sessionId}/chapter/${chapterId}/initialize`,
                {}, 
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            // CORRECTION CRUCIALE : On doit mapper le contentId ici aussi !
            this.progressions = response.data.map((p: any) => ({
                ...p,
                contentId: p.contentId || (p.content && typeof p.content === 'object' ? p.content._id : p.content)
            }));

        } catch (err: any) {
            this.error = err.response?.data?.message || "Erreur lors de l'initialisation de la progression.";
            console.error("Erreur dans getOrInitializeActivityProgression:", err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async toggleManualLock(payload: { 
    userId: string, 
    sessionId: string, 
    contentId: string, 
    contentType: string, 
    status: 'bloque' | 'en_cours' | 'valide',
    moduleId?: string,
    chapterId?: string
      }) {
    this.isLoading = true;
    this.error = null;
    try {
        // 1. Appel à la nouvelle route backend
await api.post('/api/progression/toggle-lock', {
    userId: payload.userId,
    sessionId: payload.sessionId,
    contentId: payload.contentId, // L'ID du switch sur lequel on clique
    contentType: payload.contentType, // 'Module' ou 'Chapter'
    status: payload.status,
    moduleId: payload.moduleId
});
        // 2. Rafraîchissement des données locales
        // On recharge la progression de la session pour que l'interface 
        // admin (et l'élève s'il est connecté) soit à jour immédiatement.
        await this.fetchProgressionForSession(payload.sessionId);
        
    } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la modification du verrou.";
        console.error("Erreur toggleManualLock:", err);
        throw err; // On propage l'erreur pour pouvoir l'afficher dans le composant si besoin
    } finally {
        this.isLoading = false;
    }
},

async deleteProgression(progressionId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await api.delete(`/api/progression/${progressionId}`);
        // Retire le score localement sans recharger la page
        this.progressions = this.progressions.filter(p => p._id !== progressionId);
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la suppression.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async getChapterProgressionForModule(sessionId: string, moduleId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await api.get(`/api/progression/module/${moduleId}`, { 
            params: { sessionId }
        });
        this.chapterProgressions = res.data;
      } catch (err: any) {
        this.error = err.response?.data?.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});