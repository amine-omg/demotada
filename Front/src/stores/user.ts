import { defineStore } from 'pinia';
import api from '/services/api'; 
import type { EtablissementSimple } from './etablissementsStore'; 

// --- INTERFACES ---

interface EntityData {
  _id: string;
  name: string;
  type: string;
  logo?: string;
}

interface UserFormation {
    _id: string;
    title: string;
}

export interface User {
  _id: string;
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone?: string;
  photo?: string;
  isOnboarded?: boolean;
  isHandicap?: boolean;
  situationProfessionnelle?: string;
  associatedEntity?: EntityData;
  associatedFinanceur?: EntityData;
  googleAuth?: { accessToken?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  user: {
    id: string | null;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    role: string | null;
    telephone: string | null; 
    photo: string | null;
    isOnboarded: boolean;
    isHandicap: boolean;
    situationProfessionnelle: string | null;
    associatedEntity: EntityData | null;
    associatedFinanceur: EntityData | null;
    googleAuth?: { accessToken?: string };
  };
  userList: User[];
  authToken: string | null;
  isGoogleConnected: boolean;
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
  adminSelectedContext: EtablissementSimple | null; 
  selectedUserLogs: any[];
  selectedUserStats: any;
}

interface SimpleUser {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
}

// --- UTILITAIRE DE PARSING SÉCURISÉ ---
const safelyParse = (item: string | null) => {
  try {
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn("Erreur de parsing localStorage:", e);
    return null;
  }
};

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    const userId = localStorage.getItem('userId');
    const userContextKey = userId ? `adminContext_${userId}` : null;
    const savedContext = userContextKey ? localStorage.getItem(userContextKey) : null;

    return {
      user: {
        id: userId || null,
        nom: localStorage.getItem('userNom') || null,
        prenom: localStorage.getItem('userPrenom') || null,
        email: localStorage.getItem('userEmail') || null,
        role: localStorage.getItem('userRole') || null,
        telephone: localStorage.getItem('telephone') || null,
        photo: localStorage.getItem('userPhoto') || null,
        isOnboarded: localStorage.getItem('isOnboarded') === 'true',
        isHandicap: localStorage.getItem('isHandicap') === 'true',
        situationProfessionnelle: localStorage.getItem('situationProfessionnelle') || null,
        associatedEntity: safelyParse(localStorage.getItem('associatedEntity')),
        associatedFinanceur: safelyParse(localStorage.getItem('associatedFinanceur')),
        googleAuth: undefined,
      },
      authToken: localStorage.getItem('authToken') || null,
      isGoogleConnected: localStorage.getItem('isGoogleConnected') === 'true',
      isLoading: false,
      error: null,
      userList: [],
      selectedUser: null,
      adminSelectedContext: safelyParse(savedContext),
      selectedUserLogs: [],
      selectedUserStats: null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.authToken,
    userRole: (state) => state.user.role,
    userPhotoUrl: (state) => state.user.photo, 
    isUserOnboarded: (state) => state.user.isOnboarded,
    isUserHandicap: (state) => state.user.isHandicap,
    isUserSituationProfessionnelle: (state) => state.user.situationProfessionnelle,
    isUserAssociatedWithEntity: (state) => !!state.user.associatedEntity,
    associatedEntityData: (state) => state.user.associatedEntity,
    isUserAssociatedWithFinanceur: (state) => !!state.user.associatedFinanceur,
    associatedFinanceurData: (state) => state.user.associatedFinanceur,
    userId: (state) => state.user.id,
    getAdminContext: (state) => state.adminSelectedContext,
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const cleanEmail = email.trim().toLowerCase();
        const response = await api.post('/api/auth/login', { email: cleanEmail, password });
        
        const { token, user } = response.data;
        this.setAuthToken(token);
        this.setUserData(user);
        
        return user;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Échec de la connexion.';
        console.error('Erreur lors de la connexion :', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setUserData(user: any) {
      this.user.id = user._id || user.id;
      this.user.nom = user.nom;
      this.user.prenom = user.prenom;
      this.user.email = user.email;
      this.user.telephone = user.telephone || null;
      this.user.role = user.role;
      this.user.photo = user.photo || '';
      this.user.isOnboarded = user.isOnboarded || false;
      this.user.isHandicap = user.isHandicap || false;
      this.user.situationProfessionnelle = user.situationProfessionnelle || null;
      this.user.associatedEntity = user.associatedEntity || null;
      this.user.associatedFinanceur = user.associatedFinanceur || null;
      this.user.googleAuth = user.googleAuth;

      localStorage.setItem('userId', this.user.id || '');
      localStorage.setItem('userNom', this.user.nom || '');
      localStorage.setItem('userPrenom', this.user.prenom || '');
      localStorage.setItem('telephone', this.user.telephone || ''); 
      localStorage.setItem('userEmail', this.user.email || '');
      localStorage.setItem('userRole', this.user.role || '');
      localStorage.setItem('userPhoto', this.user.photo || '');
      localStorage.setItem('isOnboarded', String(this.user.isOnboarded));
      localStorage.setItem('isHandicap', String(this.user.isHandicap));
      localStorage.setItem('situationProfessionnelle', this.user.situationProfessionnelle || '');
      
      if (this.user.associatedEntity) {
        localStorage.setItem('associatedEntity', JSON.stringify(this.user.associatedEntity));
      } else {
        localStorage.removeItem('associatedEntity');
      }

      if (this.user.associatedFinanceur) {
        localStorage.setItem('associatedFinanceur', JSON.stringify(this.user.associatedFinanceur));
      } else {
        localStorage.removeItem('associatedFinanceur');
      }

      this.setGoogleConnected(!!(user.googleAuth && user.googleAuth.accessToken));

      if (this.user.role === 'admin' && this.user.id) {
        const savedContext = localStorage.getItem(`adminContext_${this.user.id}`);
        this.adminSelectedContext = safelyParse(savedContext);
      }
    },

    setAuthToken(token: string | null) {
      this.authToken = token;
      token ? localStorage.setItem('authToken', token) : localStorage.removeItem('authToken');
    },

    async fetchUserLogs(userId: string) {
      this.isLoading = true;
      try {
        const response = await api.get(`/api/logs/user/${userId}`);
        this.selectedUserLogs = response.data.logs;
        this.selectedUserStats = response.data.stats;
      } catch (error) {
        console.error("Erreur lors de la récupération des logs", error);
      } finally {
        this.isLoading = false;
      }
    },

    setGoogleConnected(status: boolean) {
      this.isGoogleConnected = status;
      localStorage.setItem('isGoogleConnected', String(status));
    },

    setAdminContext(school: EtablissementSimple | null) {
      if (!this.user.id) return; 
      this.adminSelectedContext = school;
      const userContextKey = `adminContext_${this.user.id}`;
      school ? localStorage.setItem(userContextKey, JSON.stringify(school)) : localStorage.removeItem(userContextKey);
    },

    async logout() {
      try {
        await api.post('/api/auth/logout');
      } catch (error) {
        console.error("Le serveur n'a pas pu enregistrer la déconnexion.", error);
      }
      this.user = {
        id: null, nom: null, prenom: null, email: null, role: null, photo: null,
        isOnboarded: false, isHandicap: false, situationProfessionnelle: null,
        associatedEntity: null, associatedFinanceur: null, googleAuth: undefined,
      };
      this.authToken = null;
      this.isGoogleConnected = false;
      this.adminSelectedContext = null; 
      localStorage.clear();
    },

    async fetchUserProfile() {
      if (!this.authToken) { this.logout(); return; }
      this.isLoading = true;
      try {
        const response = await api.get('/api/users/profile');
        this.setUserData(response.data);
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) this.logout();
        throw error;
      } finally { this.isLoading = false; }
    },

    async loadApprenantList() {
      if (!this.authToken) return;
      this.isLoading = true;
      try {
        const response = await api.get(`/api/users?role=apprenant`);
        this.userList = response.data;
      } catch (err: any) {
        console.error('Erreur loadApprenantList:', err);
        throw err;
      } finally { this.isLoading = false; }
    },

    async fetchUserById(userId: string) {
      this.isLoading = true;
      this.selectedUser = null;
      try {
        const response = await api.get(`/api/users/${userId}`);
        this.selectedUser = response.data;
      } catch (err: any) {
        console.error('Erreur fetchUserById:', err);
      } finally { this.isLoading = false; }
    },

    async updateUserByAdmin(userId: string, dataToUpdate: Partial<User>): Promise<boolean> {
      this.isLoading = true;
      try {
        const response = await api.put(`/api/users/${userId}`, dataToUpdate);
        this.selectedUser = response.data; 
        return true;
      } catch (err: any) {
        console.error('Erreur updateUserByAdmin:', err);
        return false;
      } finally { this.isLoading = false; }
    },

    async deleteUserByAdmin(userId: string): Promise<boolean> {
      this.isLoading = true;
      try {
        await api.delete(`/api/users/${userId}`);
        this.userList = this.userList.filter(u => u._id !== userId);
        return true;
      } catch (err: any) {
        console.error('Erreur deleteUserByAdmin:', err);
        return false;
      } finally { this.isLoading = false; }
    },

    async submitOnboarding(role: string, customData: any) {
      if (!this.authToken) throw new Error('Non authentifié.');
      this.isLoading = true;
      try {
        const response = await api.put('/api/users/onboard-profile', { role, customData } );
        const { token, user } = response.data;
        this.setUserData(user);
        this.setAuthToken(token);
        return true;
      } catch (error: any) {
        console.error("Erreur onboarding :", error);
        throw error;
      } finally { this.isLoading = false; }
    },

    async updateUserProfile(updateData: Partial<UserState['user']>) {
      if (!this.authToken) throw new Error('Non authentifié.');
      this.isLoading = true;
      try {
        const response = await api.put('/api/users/profile', updateData);
        this.setUserData(response.data);
        return response.data;
      } catch (error: any) {
        console.error('Erreur mise à jour profil :', error);
        throw error;
      } finally { this.isLoading = false; }
    },

    async fetchUserFormations(): Promise<UserFormation[]> {
      this.isLoading = true;
      if (!this.authToken) return [];
      try {
        const response = await api.get(`/api/users/me/formations`);
        return response.data; 
      } catch (err: any) {
        console.error('Erreur fetchUserFormations:', err);
        throw err;
      } finally { this.isLoading = false; }
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
      const response = await api.post('/api/users/change-password', data);
      return response.data;
    },

    async uploadProfilePhoto(formData: FormData) {
      const response = await api.post('/api/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      this.setUserData(response.data.user); 
    },

    async uploadUserPhotoByAdmin(userId: string, formData: FormData) {
      this.isLoading = true;
      try {
        const response = await api.post(`/api/users/${userId}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        this.selectedUser = response.data;
        return true;
      } catch (error: any) {
        console.error("Erreur upload admin photo:", error);
        return false;
      } finally { this.isLoading = false; }
    },

    async fetchUsersByRole(role: string): Promise<SimpleUser[]> { 
      this.isLoading = true;
      if (!this.authToken) return [];
      try {
        const response = await api.get(`/api/users?role=${role}`);
        return response.data;
      } catch (err: any) {
        console.error('Erreur fetchUsersByRole:', err);
        throw err;
      } finally { this.isLoading = false; }
    },

    async fetchUserByEmail(email: string): Promise<any | null> {
      this.isLoading = true;
      if (!this.authToken) return null;
      try {
        const response = await api.get(`/api/users/by-email/${email}`);
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) return null; 
        throw err;
      } finally { this.isLoading = false; }
    }
  },
});