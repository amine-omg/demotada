// src/stores/emailTemplatesStore.ts
import { defineStore } from 'pinia';
import api from '/services/api'; 

export interface EmailVariable {
  tag: string;
  description: string;
}

export interface EmailTemplate {
  _id: string;
  nom: string;
  type: string;
  sujet: string;
  corps: string;
  variablesDisponibles: EmailVariable[];
  ecole: string;
}

interface EmailTemplatesState {
  templates: EmailTemplate[];
  currentTemplate: EmailTemplate | null;
  isLoading: boolean;
  error: string | null;
}

export const useEmailTemplatesStore = defineStore('emailTemplates', {
  state: (): EmailTemplatesState => ({
    templates: [],
    currentTemplate: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchTemplates(ecoleId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/api/email-templates?ecoleId=${ecoleId}`);
        this.templates = response.data;
        if (this.templates.length > 0) {
          this.currentTemplate = this.templates[0];
        }
      } catch (err: any) {
        this.error = "Erreur lors du chargement des modèles d'e-mails.";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },

    selectTemplate(templateId: string) {
      const found = this.templates.find(t => t._id === templateId);
      if (found) {
        this.currentTemplate = found;
      }
    },

    async updateTemplate(templateId: string, data: { sujet: string, corps: string }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/api/email-templates/${templateId}`, data);
        const updatedTemplate: EmailTemplate = response.data;
        const index = this.templates.findIndex(t => t._id === templateId);
        if (index !== -1) {
          this.templates[index] = updatedTemplate;
          this.currentTemplate = updatedTemplate;
        }
      } catch (err: any) {
        this.error = "Erreur lors de la sauvegarde du modèle.";
        console.error(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});