<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';
import { Scatter } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale);

const marketStore = useMarketAnalysisStore();
const certificationSearch = ref('Titre Professionnel Développeur Web et Web Mobile');

// Fonction pour lancer la recherche
const handleSearch = () => {
  if (certificationSearch.value) {
    marketStore.fetchPricingStats(certificationSearch.value);
  }
};

// Les données formatées pour le graphique
const chartData = computed(() => ({
  datasets: [
    {
      label: 'Concurrents',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      data: marketStore.pricingChartData.map(d => ({
        x: d.nombre_heures_total_mean,
        y: d.frais_ttc_tot_mean,
        label: d.nom_of // Pour l'infobulle
      })),
    },
    // On ajoutera le point de l'utilisateur ici plus tard
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: 'Durée (heures)' } },
    y: { title: { display: true, text: 'Prix (€)' } }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return context.raw.label || '';
        }
      }
    }
  }
};

// Pour arrondir les nombres
const formatNumber = (num: number) => num ? Math.round(num) : 0;
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
      <div>
        <label for="certif-search" class="label">Rechercher une certification</label>
        <input type="text" id="certif-search" v-model="certificationSearch" class="input-field w-96" placeholder="Ex: Titre Pro Développeur Web...">
      </div>
      <button @click="handleSearch" class="btn-primary self-end">Analyser les prix</button>
    </div>

    <div v-if="marketStore.isLoading" class="text-center p-8">Calcul en cours...</div>
    <div v-else-if="marketStore.pricingStats">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <p class="text-sm text-gray-500">Prix Moyen</p>
          <p class="text-2xl font-bold">{{ formatNumber(marketStore.pricingStats.prix_moyen) }} €</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <p class="text-sm text-gray-500">Prix Médian</p>
          <p class="text-2xl font-bold">{{ formatNumber(marketStore.pricingStats.prix_median) }} €</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <p class="text-sm text-gray-500">Prix/Heure Moyen</p>
          <p class="text-2xl font-bold">{{ (marketStore.pricingStats.prix_moyen / marketStore.pricingStats.duree_moyenne).toFixed(2) }} €</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <p class="text-sm text-gray-500">Fourchette de Prix</p>
          <p class="text-2xl font-bold">{{ formatNumber(marketStore.pricingStats.prix_min) }} - {{ formatNumber(marketStore.pricingStats.prix_max) }} €</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-bold mb-4">Positionnement sur le marché (Prix vs Durée)</h3>
        <div class="h-96">
          <Scatter :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>