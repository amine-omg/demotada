import { defineStore } from 'pinia';
import api from '/services/api'; 

interface DashboardData {
  activeStudents: number;
  formationsCount: number;
  revenue: number;
}

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    data: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchDashboardData(context: { ecoleId?: string | null } = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const params: { ecoleId?: string } = {};
        if (context.ecoleId) {
          params.ecoleId = context.ecoleId;
        }
        const response = await api.get('/api/dashboard', { params });
        this.data = response.data;

      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des données du dashboard.';
        console.error('Erreur fetchDashboardData:', err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});