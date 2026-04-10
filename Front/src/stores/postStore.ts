// src/stores/postStore.ts
import { defineStore } from 'pinia';
import api from '/services/api'; 
import { useUserStore } from './user'; 

interface PostUser {
  _id: string;
  nom: string;
  prenom: string;
  photo?: string;
}

interface Comment {
  _id: string;
  user: string | PostUser;
  content: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  session: string;
  author: string | PostUser;
  content: string;
  attachments: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}

export const usePostStore = defineStore('post', {
  state: (): PostState => ({
    posts: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchPostsForSession(sessionId: string) {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.error = "Authentification requise pour charger les posts.";
        this.isLoading = false;
        return;
      }

      try {
        const response = await api.get(`/api/posts?sessionId=${sessionId}`);
        this.posts = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des posts.';
        console.error('Erreur fetchPostsForSession:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async createPost(sessionId: string, content: string, attachments: string[] = []) {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.error = "Authentification requise.";
        this.isLoading = false;
        return;
      }

      try {
        const response = await api.post('/api/posts', {
          session: sessionId,
          content,
          attachments,
        });
        this.posts.unshift(response.data); 
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la création du post.';
        console.error('Erreur createPost:', err);
        throw err; 
      } finally {
        this.isLoading = false;
      }
    },

    async addComment(postId: string, content: string) {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.error = "Authentification requise.";
        this.isLoading = false;
        return;
      }

      try {
        const response = await api.post(`/api/posts/${postId}/comments`, {
          content,
        });
        // Mettre à jour le post dans le store avec le nouveau commentaire
        const updatedPost = response.data;
        const index = this.posts.findIndex(p => p._id === updatedPost._id);
        if (index !== -1) {
          this.posts[index] = updatedPost;
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire.';
        console.error('Erreur addComment:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deletePost(postId: string) {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.error = "Authentification requise.";
        this.isLoading = false;
        return;
      }
      try {
        await api.delete(`/api/posts/${postId}`);
        this.posts = this.posts.filter(p => p._id !== postId); 
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression du post.';
        console.error('Erreur deletePost:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
