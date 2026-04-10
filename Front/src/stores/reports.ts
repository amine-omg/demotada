import { defineStore } from 'pinia';
import api from '/services/api'; 

export interface ReportData {
  totalFormations: number;
  totalInscrits: number;
  tauxCompletionMoyen: number;
}

interface ReportsState {
  performanceData: ReportData | null;
  isLoading: boolean;
  error: string | null;
}

export const useReportsStore = defineStore('reports', {
  state: (): ReportsState => ({
    performanceData: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchPerformanceReport(ecoleId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('authToken');
        const response = await api.get(`/api/reports/performance?ecoleId=${ecoleId}`);
        this.performanceData = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors du chargement du rapport de performance.";
        console.error(this.error);
      } finally {
        this.isLoading = false;
      }
    },

    resetReportsState() {
      this.$reset();
    }
  }
});