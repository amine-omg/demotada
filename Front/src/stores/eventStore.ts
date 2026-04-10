import { defineStore } from 'pinia';
// On remplace axios par notre instance centralisée 'api'
import api from '/services/api'; 
import { useUserStore } from './user';

// Interface pour la structure d'un événement
interface Event {
  id?: string;
  title: string;
  start: string | Date;
  end: string | Date;
  allDay: boolean;
  color?: string;
  description?: string;
}

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export const useEventStore = defineStore('event', {
  state: (): EventState => ({
    events: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // Action pour récupérer les événements depuis le backend
    async fetchEvents() {
      const userStore = useUserStore();
      // Le guard est utile pour éviter un appel API inutile
      if (!userStore.authToken) {
        this.error = "Utilisateur non authentifié.";
        return;
      }

      this.isLoading = true;
      this.error = null;
      try {
        // On utilise 'api.get' avec une URL relative. Le header est ajouté automatiquement.
        const response = await api.get('/api/events');
        
        // FullCalendar a besoin que les dates soient des objets Date
        this.events = response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
      } catch (err) {
        this.error = "Erreur lors du chargement des événements.";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },

    // Action pour créer un nouvel événement
    async createEvent(eventData: Omit<Event, 'id'>) {
      const userStore = useUserStore();
      if (!userStore.authToken) {
        this.error = "Utilisateur non authentifié.";
        return;
      }

      this.isLoading = true;
      try {
        // On utilise 'api.post'. L'URL complète et le header sont gérés automatiquement.
        const response = await api.post('/api/events', eventData);

        // Ajoute le nouvel événement à la liste locale pour une mise à jour instantanée
        this.events.push({
            ...response.data,
            start: new Date(response.data.start),
            end: new Date(response.data.end),
        });
      } catch (err) {
        this.error = "Erreur lors de la création de l'événement.";
        console.error(err);
        throw err; // Permet au composant de gérer l'échec
      } finally {
        this.isLoading = false;
      }
    },
  },
});