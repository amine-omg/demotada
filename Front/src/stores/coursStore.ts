// src/stores/coursStore.ts
import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user'; 

interface PopulatedUser {
    _id: string;
    nom: string;
    prenom: string;
    photo?: string;
    email?: string;
}

interface Attendance {
    user: string | PopulatedUser; 
    status: 'present' | 'absent' | 'late' | 'morning_present' | 'afternoon_present' | 'morning_absent' | 'afternoon_absent';
    signedAt?: string;
}

interface Cours {
    _id: string;
    session: string; 
    date: string; 
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    meetLink?: string;
    topicsCovered: string[];
    isMorningActive: boolean;
    isAfternoonActive: boolean;
    attendance: Attendance[];
    orderInSession: number;
    createdBy?: string | PopulatedUser;
    createdAt: string;
    updatedAt: string;
}

interface CoursState {
  coursForSession: Cours[];
  nextCoursData: { 
    nextCours: Cours | null;
    isLive: boolean;
    message?: string; 
  };
  isLoading: boolean;
  error: string | null;
}

export const useCoursStore = defineStore('cours', {
    state: (): CoursState => ({
        cours: [],
        currentCours: null,
        isLoading: false,
        coursForSession: [],
        nextCoursData: { nextCours: null, isLive: false, message: "Chargement..." }, 
        error: null,
        isUpdating: false,
    }),

    getters: {
        getSortedCours: (state) => {
            return [...state.coursForSession].sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (dateA !== dateB) return dateA - dateB;
                return a.orderInSession - b.orderInSession;
            });
        },
        getCoursById: (state) => (coursId: string) => {
            return state.coursForSession.find(c => c._id === coursId);
        },
    },

    actions: {
        async fetchCoursForSession(sessionId: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.get(`/api/cours?sessionId=${sessionId}`);
                this.coursForSession = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement des journées de cours.';
            } finally {
                this.isLoading = false;
            }
        },

        async createCours(coursData: Partial<Cours>) {
            this.isUpdating = true;
            this.error = null;
            try {
                const response = await api.post('/api/cours', coursData);
                this.coursForSession.push(response.data);
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la création du cours.';
                throw err;
            } finally {
                this.isUpdating = false;
            }
        },

        async updateCours(coursId: string, updateData: Partial<Cours>) {
            this.isUpdating = true;
            this.error = null;
            try {
                const response = await api.put(`/api/cours/${coursId}`, updateData);
                const updatedCours: Cours = response.data;
                const index = this.coursForSession.findIndex(c => c._id === updatedCours._id);
                if (index !== -1) {
                    this.coursForSession[index] = updatedCours;
                }
                return updatedCours;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la mise à jour du cours.';
                throw err;
            } finally {
                this.isUpdating = false;
            }
        },

        async deleteCours(coursId: string) {
            this.isUpdating = true;
            this.error = null;
            try {
                await api.delete(`/api/cours/${coursId}`);
                this.coursForSession = this.coursForSession.filter(c => c._id !== coursId);
                return true;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la suppression du cours.';
                throw err;
            } finally {
                this.isUpdating = false;
            }
        },

async generateZoomSignature(coursId: string) {
  this.isLoading = true;
  this.error = null;
  const userStore = useUserStore();

  if (!userStore.authToken) {
    this.error = "Authentification requise.";
    this.isLoading = false;
    throw new Error(this.error);
  }

  try {
    const response = await api.post(
      `/api/cours/${coursId}/generate-signature`, {});
    return response.data;

  } catch (err: any) {
    const errorMessage = err.response?.data?.message || "Erreur lors de la génération de la signature Zoom.";
    this.error = errorMessage;
    console.error('Erreur dans generateZoomSignature:', err);
    throw new Error(errorMessage);
  } finally {
    this.isLoading = false;
  }
},

async forceCoursLive(coursId: string) {
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');
            if (!authToken) throw new Error("Authentification requise.");

            try {
                await api.post(`/api/cours/${coursId}/force-live`, {});
                if (this.nextCoursData.nextCours?.session) {
                   await this.fetchNextCoursForSession(this.nextCoursData.nextCours.session);
                }
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du forçage du cours.';
                console.error('Erreur forceCoursLive:', err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

async generateZoomLinkForCours(coursId: string) {
  this.isLoading = true;
  this.error = null;
  const userStore = useUserStore();

  try {
    const response = await api.post(
      `/api/cours/${coursId}/generate-link`,
      {}
    );
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || "Erreur lors de la génération du lien Zoom.";
    this.error = errorMessage;
    console.error('Erreur dans generateZoomLinkForCours:', err);
    throw new Error(errorMessage);
  } finally {
    this.isLoading = false;
  }
},

    async fetchNextCoursForSession(sessionId: string) {
      this.isLoading = true;
      this.error = null;
      this.nextCoursData = { nextCours: null, isLive: false, message: "Chargement..." };
      try {
        const url = `/api/cours/next?sessionId=${sessionId}`;
        console.log(`[CoursStore] Appel API pour prochain cours: GET ${url}`);
        const response = await api.get(url);
        console.log("[CoursStore] Réponse API prochain cours:", response.data);
        this.nextCoursData = response.data; 
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement du prochain cours.';
        console.error('[CoursStore] Erreur lors du fetch du prochain cours:', err.response?.data || err.message);
        this.nextCoursData.message = this.error; 
      } finally {
        this.isLoading = false;
        console.log("[CoursStore] Chargement prochain cours terminé. IsLoading:", this.isLoading);
      }
    },

        async markAttendance(coursId: string, userId: string, status: Attendance['status']) {
            this.isUpdating = true;
            this.error = null;
            try {
                const response = await api.put(`/api/cours/${coursId}/attendance`, { userId, status });
                const updatedCours: Cours = response.data;
                const index = this.cours.findIndex(c => c._id === updatedCours._id);
                if (index !== -1) {
                    this.cours[index] = updatedCours; 
                }
                return updatedCours;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du marquage de la présence.';
                console.error('Erreur markAttendance:', err);
                throw err;
            } finally {
                this.isUpdating = false;
            }
        },

        setCurrentCours(cours: Cours | null) {
            this.currentCours = cours;
        },

        resetCoursState() {
            this.$reset();
        }
    }
});
