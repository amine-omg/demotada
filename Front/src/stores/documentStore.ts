// src/stores/documentStore.ts
import { defineStore } from 'pinia';
import api from '/services/api'; 

// Interfaces pour les relations peuplées
interface PopulatedUser {
  _id: string;
  nom: string;
  prenom: string;
  photo?: string;
}

interface PopulatedSession {
  _id: string;
  title: string;
}

interface PopulatedFormation {
  _id: string;
  title: string;
}

export interface Document {
  _id: string;
  title: string;
  description?: string;
  type: 'devoir' | 'support' | 'attestation' | 'diplome' | 'transactionnel' | 'emargement'; 
  fileUrl: string; 
  session?: string | PopulatedSession | null;
  formation?: string | PopulatedFormation | null;
  createdBy: string | PopulatedUser; 
  dueDate?: string | null; 
  issueDate?: string | null;
  relatedToUser?: string | PopulatedUser | null;
  isValidated: boolean;
  isSubmitted?: boolean; 
  submissionUrl?: string | null; 
  submittedBy?: string | PopulatedUser | null; 
  submissionDate?: string | null; 
  templateId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
}

export const useDocumentStore = defineStore('document', {
  state: (): DocumentState => ({
    documents: [],
    isLoading: false,
    error: null,
  }),

  actions: {

async fetchDocuments(filters: { 
  sessionId?: string; 
  formationId?: string; 
  type?: string; 
  relatedToUser?: string; 
  createdBy?: string;
  ecoleId?: string | null; 
  createdByUserId?: string | null;
} = {}) {
  this.isLoading = true;
  this.error = null;
  this.documents = [];

  try {
    const params = new URLSearchParams();
    
    if (filters.ecoleId) params.append('ecoleId', filters.ecoleId);
    if (filters.createdByUserId) params.append('createdBy', filters.createdByUserId); 
    if (filters.sessionId) params.append('session', filters.sessionId);
    if (filters.formationId) params.append('formation', filters.formationId);
    if (filters.type) params.append('type', filters.type);
    if (filters.relatedToUser) params.append('relatedToUser', filters.relatedToUser);
    
    const url = `/api/documents?${params.toString()}`;
    const response = await api.get(url);
    this.documents = response.data;

  } catch (err: any) {
    this.error = err.response?.data?.message || 'Erreur lors du chargement des documents.';
  } finally {
    this.isLoading = false;
  }
},

    async createDocument(documentData: Partial<Document>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/api/documents', documentData);
        const newDocument = response.data;
        this.documents.push(newDocument); 
        return newDocument;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la création du document.';
        console.error('Erreur createDocument:', err.response?.data || err.message);
        throw err; 
      } finally {
        this.isLoading = false;
      }
    },

    async updateDocument(documentId: string, updateData: Partial<Document>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/api/documents/${documentId}`, updateData);
        const updatedDoc = response.data;
        const index = this.documents.findIndex(d => d._id === updatedDoc._id);
        if (index !== -1) {
          this.documents[index] = updatedDoc; 
        }
        return updatedDoc;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la mise à jour du document.';
        console.error('Erreur updateDocument:', err.response?.data || err.message);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async submitAssignment(documentId: string, submissionUrl: string) {
      this.isLoading = true;
      this.error = null;
      try {
        console.log(`[DocumentStore] Tentative de soumission du devoir ${documentId} avec URL: ${submissionUrl}`);
        const response = await api.put(`/api/documents/${documentId}/submit-assignment`, { submissionUrl });
        const updatedDoc = response.data;
        const index = this.documents.findIndex(d => d._id === updatedDoc._id);
        if (index !== -1) {
          this.documents[index] = updatedDoc;
        }
        console.log("[DocumentStore] Devoir soumis avec succès:", updatedDoc);
        return updatedDoc;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la soumission du devoir.';
        console.error('Erreur submitAssignment:', err.response?.data || err.message);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteDocument(documentId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await api.delete(`/api/documents/${documentId}`);
        this.documents = this.documents.filter(d => d._id !== documentId); 
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression du document.';
        console.error('Erreur deleteDocument:', err.response?.data || err.message);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
