// src/stores/assignmentStore.ts
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

export interface Submission {
  _id: string;
  assignment: string; 
  student: string | PopulatedUser; 
  submissionUrl: string;
  submissionDate: string; 
  grade?: number | null; 
  gradedBy?: string | PopulatedUser | null;
  gradedDate?: string | null; 
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string; 
  session: string;
  formation: string;
  dueDate: string; 
  createdBy: string | PopulatedUser; 
  submissions: Submission[]; 
  createdAt: string;
  updatedAt: string;
}

interface AssignmentState {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
}

export const useAssignmentStore = defineStore('assignment', {
  state: (): AssignmentState => ({
    assignments: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchAssignments(filters: { sessionId?: string; formationId?: string } = {}) {
      this.isLoading = true;
      this.error = null;
      this.assignments = [];
      try {
        const params = new URLSearchParams(filters as Record<string, string>).toString();
        const url = `/api/assignments${params ? `?${params}` : ''}`;
        console.log(`[AssignmentStore] Appel API: GET ${url}`);

        const response = await api.get(url);

        console.log("[AssignmentStore] Réponse API devoirs:", response.data);
        this.assignments = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des devoirs.';
        console.error('Erreur fetchAssignments:', err.response?.data || err.message);
      } finally {
        this.isLoading = false;
      }
    },

    async createAssignment(assignmentData: Partial<Assignment>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/api/assignments', assignmentData);
        const newAssignment: Assignment = response.data;
        this.assignments.push(newAssignment); 
        return newAssignment;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la création du devoir.';
        console.error('Erreur createAssignment:', err.response?.data || err.message);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async submitAssignment(assignmentId: string, submissionUrl: string) {
      this.isLoading = true;
      this.error = null;
      try {
        console.log(`[AssignmentStore] Tentative de soumission du devoir ${assignmentId} avec URL: ${submissionUrl}`);
        const response = await api.post(`/api/assignments/${assignmentId}/submit`, { submissionUrl });
        const updatedAssignment: Assignment = response.data;
        const index = this.assignments.findIndex(a => a._id === updatedAssignment._id);
        if (index !== -1) {
          this.assignments[index] = updatedAssignment;
        }
        console.log("[AssignmentStore] Devoir soumis avec succès:", updatedAssignment);
        return updatedAssignment;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la soumission du devoir.';
        console.error('Erreur submitAssignment:', err.response?.data || err.message);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async gradeSubmission(assignmentId: string, submissionId: string, grade: number) {
      this.isLoading = true;
      this.error = null;
      try {
        console.log(`[AssignmentStore] Tentative de noter la soumission ${submissionId} du devoir ${assignmentId} avec la note ${grade}`);
        const response = await api.put(`/api/assignments/${assignmentId}/grade-submission`, { submissionId, grade });
        const updatedAssignment: Assignment = response.data;
        const index = this.assignments.findIndex(a => a._id === updatedAssignment._id);
        if (index !== -1) {
          this.assignments[index] = updatedAssignment;
        }
        console.log("[AssignmentStore] Soumission notée avec succès:", updatedAssignment);
        return updatedAssignment;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la notation de la soumission.';
        console.error('Erreur gradeSubmission:', err.response?.data || err.message);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
