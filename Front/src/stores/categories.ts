// src/stores/categories.ts
import { defineStore } from 'pinia';
import api from '/services/api'; 

interface Category {
  _id: string;
  name: string;
  createdBy?: string; 
}

interface CategoriesState {
  allCategories: Category[]; 
  isLoading: boolean;
  error: string | null;
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    allCategories: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getAllCategories: (state) => state.allCategories,
  },

  actions: {

    async fetchCategories(context: { 
      ecoleId?: string | null; 
      createdByUserId?: string | null;
    } = {}) {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');

      if (!authToken) {
        this.error = "Authentification requise pour charger les catégories.";
        this.isLoading = false;
        return;
      }

      try {
        let url = '/api/categories';
        const params = new URLSearchParams();
        if (context.ecoleId) {
          params.append('ecoleId', context.ecoleId);
        } 
        else if (context.createdByUserId) {
          params.append('createdBy', context.createdByUserId);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        this.allCategories = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des catégories.';
        console.error('Erreur fetchCategories:', err);
        this.allCategories = []; 
      } finally {
        this.isLoading = false;
      }
    },

    async createCategory(categoryData: { name: string }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/api/categories', categoryData);
        this.allCategories.push(response.data); 
        return response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la création de la catégorie.';
        console.error('Erreur createCategory:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateCategory(categoryId: string, updateData: { name: string }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/api/categories/${categoryId}`, updateData);
        const index = this.allCategories.findIndex(cat => cat._id === categoryId);
        if (index !== -1) {
          this.allCategories[index] = response.data;
        }
        return response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la mise à jour de la catégorie.';
        console.error('Erreur updateCategory:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCategory(categoryId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await api.delete(`/api/categories/${categoryId}`);
        this.allCategories = this.allCategories.filter(cat => cat._id !== categoryId);
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression de la catégorie.';
        console.error('Erreur deleteCategory:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
