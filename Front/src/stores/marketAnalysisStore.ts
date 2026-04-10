import { defineStore } from 'pinia';
import api from '/services/api'; 

export interface CompetitorFormation {
  nom_of: string;
  intitule_formation: string;
  frais_ttc_tot_mean: number;
  nom_region: string;
}

export const useMarketAnalysisStore = defineStore('marketAnalysis', {
  state: () => ({
    competitorResults: [] as CompetitorFormation[],
    totalCount: 0,
    isLoading: false,
    pricingStats: null as any, 
    pricingChartData: [] as any[], 
    opportunities: [] as any[], 
    keywords: [] as { text: string, value: number }[], 
    heatmapData: [] as { nom_departement: string, count: number }[],
    topCertificationsData: [] as { intitule_certification: string, count: number }[],
    error: null as string | null,
  }),
actions: {

    async fetchMarketData(filters: { region?: string; domain?: string; certification?: string }) {
      this.isLoading = true;
      this.error = null;
      this.competitorResults = [];
      try {
        const response = await api.get('/api/market-analysis/data', { params: filters });
        this.competitorResults = response.data.results;
        this.totalCount = response.data.total_count;

      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la récupération des données de marché.';
        console.error('Erreur fetchMarketData:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPricingStats(certification: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await api.get('/api/market-analysis/pricing-stats', {
          params: { certification }
        });
        this.pricingStats = response.data.stats;
        this.pricingChartData = response.data.scatterPoints;

      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la récupération des statistiques.';
        console.error('Erreur fetchPricingStats:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOpportunities(filters: { region: string; domain: string }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/api/market-analysis/opportunities', {
          params: filters
        });
        this.opportunities = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la recherche d\'opportunités.';
        console.error('Erreur fetchOpportunities:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchKeywords(certification: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/api/market-analysis/keywords', {
          params: { certification }
        });
        this.keywords = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de l\'analyse des mots-clés.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchHeatmapData(keyword: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/api/market-analysis/heatmap', {
          params: { keyword }
        });
        this.heatmapData = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la récupération des données de la carte.';
        console.error('Erreur fetchHeatmapData:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTopCertifications(keyword: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/api/market-analysis/top-certifications', {
          params: { keyword }
        });
        this.topCertificationsData = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de l\'analyse des certifications.';
        console.error('Erreur fetchTopCertifications:', err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});