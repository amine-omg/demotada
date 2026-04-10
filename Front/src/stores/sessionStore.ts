import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user';

import { useProgressionStore } from './progressionStore'; 

interface SessionUser {
  userId: string; 
  nom: string; 
  prenom: string; 
  email: string; 
  role: 'formateur' | 'apprenant'; 
  completion: number; 
  dateInscription: string; 
  enAttenteValidation?: boolean;
  isMuted?: boolean; 
  photo?: string; 
  hasDisability?: boolean;
}

interface PopulatedFormation {
    _id: string;
    title: string;
    image: string;
    category?: string;
}

interface Session {
  _id: string;
  formation: string | PopulatedFormation;
  type: 'programme' | 'continue';
  title: string;
  description: string;
  dateDebut?: string;
  dateFin?: string;
  dateExamen?: string;
  lieu?: string;

  isAutonomyEnabled: boolean; 

  lienZoomUnique?: string;
  formateurs: SessionUser[];
  elevesInscrits: SessionUser[];
  isDefaultContinuous: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  statutPublication: 'brouillon' | 'publiée';  
  planning: PlanningEvent[]; 
  cours: string[]; 
  status?: 'à venir' | 'en cours' | 'passée' | 'continue' | 'inconnu'; 
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null; 
  continuousSession: Session | null;
  continuousStudents: SessionUser[];
  isLoading: boolean;
  error: string | null;
  filters: {
    searchLieu: string;
    formationId: string | null;
    formateurId: string | null;
    categoryId: string | null;
  };
}

interface ContentItem {
    _id?: string; 
    item: string; 
    itemType: 'Chapter';
    status: 'Prévu' | 'Terminé' | 'Sauté';
}


interface PlanningEvent {
    _id?: string;
    title: string;
    startDate?: string;
    order: number;
    contentItems: ContentItem[];
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    sessions: [],
    currentSession: null,
    continuousSession: null,
    continuousStudents: [],
    isLoading: false,
    error: null,
    filters: {
      searchLieu: '',
      formationId: null,
      formateurId: null,
      categoryId: null,
    },
  }),

  actions: {
async fetchSessions(context: { 
  ecoleId?: string | null; 
  userId?: string | null;
  role?: string | null;
} = {}) {
    this.isLoading = true;
    this.error = null;

    try {
        const params: { ecoleId?: string; intervenantId?: string } = {};
        if (context.ecoleId) {
            params.ecoleId = context.ecoleId;
        } else if (context.role === 'formateur' && context.userId) {
            params.intervenantId = context.userId;
        }
        
        // 1. On lance l'appel API
        const response = await api.get('/api/sessions', { params });
        
        // 2. MISE À JOUR ATOMIQUE : On remplace tout d'un coup.
        // Si la requête avait échoué, on n'arriverait pas ici.
        // Les cartes formations ne verront jamais un tableau vide.
        this.sessions = response.data || []; 

    } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des sessions.';
        console.error('Erreur fetchSessions:', err);
        // OPTIONNEL : Si tu veux vraiment vider en cas d'ERREUR critique (sécurité) :
        // this.sessions = []; 
    } finally {
        this.isLoading = false;
    }
},


    async fetchSessionById(sessionId: string): Promise<Session | null> {
    this.isLoading = true;
    this.error = null;
    try {
        const response = await api.get(`/api/sessions/${sessionId}`);
        
        this.currentSession = response.data; // Stocke la session chargée
        return response.data;
    } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement de la session.';
        console.error('Erreur fetchSessionById:', err);
        throw err; // Propage l'erreur
    } finally {
        this.isLoading = false;
    }
    },


   async fetchSessionsAndContinuousData(formationId: string) {
      this.isLoading = true;
      this.error = null;
      // SUPPRESSION DU VIDAGE IMMÉDIAT (this.sessions = [], etc.)

      try {
        // 1. Appel API pour récupérer toutes les sessions de la formation
        const allSessionsResponse = await api.get(`/api/sessions/for-formation/${formationId}`);
        const allSessions: Session[] = allSessionsResponse.data || [];

        // 2. Mise à jour atomique : on ne remplace que si on a les données
        this.sessions = allSessions.filter((s: Session) => s.type === 'programme');
        this.continuousSession = allSessions.find((s: Session) => s.type === 'continue' && s.isDefaultContinuous) || null;

        // 3. Chargement des élèves pour la session continue si elle existe
        if (this.continuousSession) {
            const studentsResponse = await api.get(`/api/sessions/for-formation/${formationId}/students-continuous`);
            this.continuousStudents = studentsResponse.data || [];
        } else {
            // Nettoyage ciblé si aucune session continue n'existe pour cette formation
            this.continuousStudents = [];
        }

      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des données de session.';
        console.error('Erreur fetchSessionsAndContinuousData:', err);
        // En cas d'erreur critique, tu peux décider de vider ou de garder les anciennes data
      } finally {
        this.isLoading = false;
      }
    },

    async generateSessionZoomLink(sessionId: string) {
    this.isLoading = true;
    this.error = null;
    try {
        const response = await api.put(`/api/sessions/${sessionId}/generate-zoom-link`);
        this.currentSession = response.data;
    } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la génération du lien.';
        throw err;
    } finally {
        this.isLoading = false;
    }
},

    async fetchAllProgrammedSessionsForUser(userId: string) {
        this.isLoading = true;
        this.error = null;
        this.sessions = []; 
        try {
            let url = `/api/sessions`;
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (this.filters.searchLieu) params.append('lieu', this.filters.searchLieu);
            if (this.filters.formationId) params.append('formationId', this.filters.formationId);
            if (this.filters.formateurId) params.append('formateurId', this.filters.formateurId);
            if (this.filters.categoryId) params.append('categoryId', this.filters.categoryId);
            if (params.toString()) { url += `?${params.toString()}`; }

            const response = await api.get(url);
            const fetchedSessions: Session[] = response.data || []; 

            console.log('fetchAllProgrammedSessionsForUser (Store): Réponse API brute (sessions avec status):', fetchedSessions.map(s => ({_id: s._id, title: s.title, status: s.status, dateDebut: s.dateDebut, dateFin: s.dateFin}))); // DEBUG

            this.sessions = fetchedSessions.filter((s: Session) => s.type === 'programme') || [];
            console.log('fetchAllProgrammedSessionsForUser (Store): Sessions filtrées et stockées:', this.sessions.map(s => ({_id: s._id, title: s.title, status: s.status}))); // DEBUG
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors du chargement des sessions de l\'utilisateur.';
            console.error('Erreur fetchAllProgrammedSessionsForUser:', err);
        } finally {
            this.isLoading = false;
        }
    },

async toggleAutonomy(sessionId: string) {
  this.isLoading = true;
  this.error = null;
  try {
    const response = await api.put(
      `/api/sessions/${sessionId}/toggle-autonomy`    );
    this.currentSession = response.data;
     const progressionStore = useProgressionStore(); // On importe à la volée
    await progressionStore.fetchProgressionForSession(sessionId);
    return this.currentSession;
  } catch (err: any) {
    this.error = err.response?.data?.message || "Erreur lors du changement de mode d'autonomie.";
    console.error("Erreur dans toggleAutonomy:", err);
    throw err;
  } finally {
    this.isLoading = false;
  }
},

    async fetchSessionsForApprenant() {
        this.isLoading = true;
        this.error = null;
        this.sessions = []; 

        try {
            const url = `/api/sessions/apprenant`;
            console.log(`[SessionStore] Appel API pour les sessions de l'apprenant: GET ${url}`);

            const response = await api.get(url);
            
            this.sessions = response.data;
            console.log("[SessionStore] Sessions de l'apprenant chargées et stockées:", this.sessions.map(s => ({_id: s._id, title: s.title, status: s.status})));

        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors du chargement des sessions de l\'apprenant.';
            console.error('Erreur fetchSessionsForApprenant:', err.response?.data || err.message);
        } finally {
            this.isLoading = false;
        }
    },

    async createSession(sessionData: Partial<Session>, refreshType: 'global' | 'formation' | 'none' = 'global') {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await api.post('/api/sessions', sessionData);
            const newSession: Session = response.data;
            console.log("createSession (store): Nouvelle session créée avec succès:", newSession);

            const userStore = useUserStore();
            if (refreshType === 'global' && userStore.user.id) {
                await this.fetchAllProgrammedSessionsForUser(userStore.user.id);
            } else if (refreshType === 'formation' && newSession.formation && typeof newSession.formation === 'string') {
                await this.fetchSessionsAndContinuousData(newSession.formation);
            } else if (refreshType === 'formation' && newSession.formation && typeof newSession.formation === 'object' && newSession.formation._id) {
                 await this.fetchSessionsAndContinuousData(newSession.formation._id);
            } else if (refreshType === 'none') {
                 console.log("createSession (store): Pas de rafraîchissement automatique après création.");
            } else {
                console.warn("createSession (store): Impossible de rafraîchir la liste des sessions: contexte ou ID utilisateur/formation manquant.");
            }

            return newSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors de la création de la session.';
            console.error('Erreur createSession (store):', err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

 async updateSession(sessionId: string, updateData: Partial<Session>, refreshType: 'global' | 'formation' | 'none' = 'global') {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await api.put(`/api/sessions/${sessionId}`, updateData);
            const updatedSession: Session = response.data;

            // --- MISE À JOUR DE LA RÉACTIVITÉ ---
            // On met à jour la session actuelle pour que tous les titres et 
            // composants liés à 'currentSession' changent instantanément à l'écran.
            this.currentSession = updatedSession; 
            
            // On met également à jour l'entrée correspondante dans la liste locale des sessions
            const index = this.sessions.findIndex(s => s._id === sessionId);
            if (index !== -1) {
                this.sessions[index] = updatedSession;
            }

            const userStore = useUserStore();
            if (refreshType === 'global' && userStore.user.id) {
                await this.fetchAllProgrammedSessionsForUser(userStore.user.id);
            } else if (refreshType === 'formation' && updatedSession.formation && typeof updatedSession.formation === 'string') {
                await this.fetchSessionsAndContinuousData(updatedSession.formation);
            } else if (refreshType === 'formation' && updatedSession.formation && typeof updatedSession.formation === 'object' && updatedSession.formation._id) {
                 await this.fetchSessionsAndContinuousData(updatedSession.formation._id);
            }

            return updatedSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors de la mise à jour de la session.';
            console.error('Erreur updateSession:', err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async deleteSession(sessionId: string, formationId: string, refreshType: 'global' | 'formation' | 'none' = 'global') {
        this.isLoading = true;
        this.error = null;
        try {
            await api.delete(`/api/sessions/${sessionId}`);
            const userStore = useUserStore();
            if (refreshType === 'global' && userStore.user.id) {
                await this.fetchAllProgrammedSessionsForUser(userStore.user.id);
            } else if (refreshType === 'formation' && formationId) {
                await this.fetchSessionsAndContinuousData(formationId);
            }
            return true;
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors de la suppression de la session.';
            console.error('Erreur deleteSession:', err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async addEleveToSession(sessionId: string, eleveId: string) {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await api.put(`/api/sessions/${sessionId}/add-eleve`, { eleveId });
            const updatedSession: Session = response.data;
            const userStore = useUserStore();
            if (userStore.user.id) {
                await this.fetchAllProgrammedSessionsForUser(userStore.user.id);
            }
            return updatedSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors de l\'ajout de l\'élève à la session.';
            console.error('Erreur addEleveToSession:', err);
            return null;
        } finally {
            this.isLoading = false;
        }
    },
    async addEleveToSessionByEmail(sessionId: string, eleveEmail: string) {
        this.isLoading = true;
        this.error = null;
        try {
            console.log(`[SessionStore] Tentative d'ajout de ${eleveEmail} à la session ${sessionId}`);
            const response = await api.put(`/api/sessions/${sessionId}/add-eleve-by-email`, { email: eleveEmail });
            const updatedSession: Session = response.data;
            this.currentSession = updatedSession; 
            console.log("[SessionStore] Élève ajouté, session mise à jour:", updatedSession);
            return updatedSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors de l\'ajout de l\'élève à la session par email.';
            console.error('Erreur addEleveToSessionByEmail:', err.response?.data || err.message);
            throw err; 
        } finally {
            this.isLoading = false;
        }
    },
    async removeEleveFromSession(sessionId: string, eleveId: string) {
        this.isLoading = true;
        this.error = null;
        try {
            console.log(`[SessionStore] Tentative de retrait de l'élève ${eleveId} de la session ${sessionId}`);
            const response = await api.put(`/api/sessions/${sessionId}/remove-eleve`, { eleveId });
            const updatedSession: Session = response.data;
            this.currentSession = updatedSession; // Mettre à jour la session actuelle
            console.log("[SessionStore] Élève retiré, session mise à jour:", updatedSession);
            return updatedSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors du retrait de l\'élève de la session.';
            console.error('Erreur removeEleveFromSession:', err.response?.data || err.message);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async toggleEleveMuteStatus(sessionId: string, eleveId: string) {
        this.isLoading = true;
        this.error = null;
        try {
            console.log(`[SessionStore] Tentative de basculer le statut 'mute' de l'élève ${eleveId} dans la session ${sessionId}`);
            const response = await api.put(`/api/sessions/${sessionId}/toggle-mute-eleve`, { eleveId });
            const updatedSession: Session = response.data;
            this.currentSession = updatedSession; // Mettre à jour la session actuelle
            console.log("[SessionStore] Statut 'mute' de l'élève mis à jour, session actualisée:", updatedSession);
            return updatedSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || 'Erreur lors de la modification du statut "mute" de l\'élève.';
            console.error('Erreur toggleEleveMuteStatus:', err.response?.data || err.message);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async addPlanningEvent(sessionId: string, eventData: { title: string; startDate?: Date }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post(`/api/sessions/${sessionId}/planning/events`, eventData);
        if (this.currentSession) {
          this.currentSession.planning = response.data;
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de l'ajout de l'événement.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updatePlanningEvent(sessionId: string, eventId: string, eventData: { title?: string; startDate?: Date }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/api/sessions/${sessionId}/planning/events/${eventId}`, eventData);
        if (this.currentSession) {
          const index = this.currentSession.planning.findIndex(e => e._id === eventId);
          if (index !== -1) {
            this.currentSession.planning[index] = { ...this.currentSession.planning[index], ...response.data };
          }
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la mise à jour de l'événement.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deletePlanningEvent(sessionId: string, eventId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await api.delete(`/api/sessions/${sessionId}/planning/events/${eventId}`);
        if (this.currentSession) {
          this.currentSession.planning = this.currentSession.planning.filter(e => e._id !== eventId);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la suppression de l'événement.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async reorderPlanningEvents(sessionId: string, orderedIds: string[]) {
      if (!this.currentSession) return;
      const eventMap = new Map(this.currentSession.planning.map(event => [event._id, event]));
      this.currentSession.planning = orderedIds.map(id => eventMap.get(id!)).filter(Boolean) as PlanningEvent[];
      try {
        await api.put(`/api/sessions/${sessionId}/planning/reorder`, { orderedIds });
      } catch (err: any) {
        console.error("Erreur lors de la réorganisation du planning:", err);
        this.fetchSessionById(sessionId); 
        throw err;
      }
    },

    async addIntervenantByEmail(sessionId: string, email: string) {
        this.isLoading = true;
        this.error = null;
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            this.error = "Authentification requise.";
            this.isLoading = false;
            throw new Error(this.error);
        }
        try {
            const response = await api.put(`/api/sessions/${sessionId}/add-intervenant`, { email }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // On met à jour la session en cours avec les données fraîches
            this.currentSession = response.data;
            return this.currentSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || "Erreur lors de l'ajout de l'intervenant.";
            console.error('Erreur addIntervenantByEmail:', err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async removeIntervenant(sessionId: string, userId: string) {
        this.isLoading = true;
        this.error = null;
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            this.error = "Authentification requise.";
            this.isLoading = false;
            throw new Error(this.error);
        }
        try {
            const response = await api.put(`/api/sessions/${sessionId}/remove-intervenant`, { userId }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // On met à jour la session en cours
            this.currentSession = response.data;
            return this.currentSession;
        } catch (err: any) {
            this.error = err.response?.data?.message || "Erreur lors du retrait de l'intervenant.";
            console.error('Erreur removeIntervenant:', err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async addItemToEvent(sessionId: string, eventId: string, itemData: { item: string; itemType: 'Chapter' }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post(`/api/sessions/${sessionId}/planning/events/${eventId}/items`, itemData);
        if (this.currentSession) {
          const eventIndex = this.currentSession.planning.findIndex(e => e._id === eventId);
          if (eventIndex !== -1) {
            this.currentSession.planning[eventIndex] = response.data;
          }
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de l'ajout de l'item.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async removeItemFromEvent(sessionId: string, eventId: string, contentItemId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await api.delete(`/api/sessions/${sessionId}/planning/events/${eventId}/items/${contentItemId}`);
        if (this.currentSession) {
          const event = this.currentSession.planning.find(e => e._id === eventId);
          if (event) {
            event.contentItems = event.contentItems.filter(item => item._id !== contentItemId);
          }
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la suppression de l'item.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateItemStatus(sessionId: string, eventId: string, contentItemId: string, status: 'Prévu' | 'Terminé' | 'Sauté') {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/api/sessions/${sessionId}/planning/events/${eventId}/items/${contentItemId}`, { status });
        if (this.currentSession) {
          const event = this.currentSession.planning.find(e => e._id === eventId);
          if (event) {
            const itemIndex = event.contentItems.findIndex(item => item._id === contentItemId);
            if (itemIndex !== -1) {
              event.contentItems[itemIndex] = response.data;
            }
          }
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la mise à jour du statut.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

  },
});

