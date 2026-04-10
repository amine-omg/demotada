<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const marketStore = useMarketAnalysisStore();
const keywordSearch = ref('Intelligence Artificielle');
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const handleSearch = () => {
  if (keywordSearch.value) {
    marketStore.fetchMarketTrends(keywordSearch.value);
  }
};

watch(() => marketStore.trendsData, (newData) => {
    nextTick(() => {
        if (!chartCanvas.value) return;

        if (chartInstance) {
            chartInstance.destroy();
        }

        if (!newData || newData.length === 0) return;

        chartInstance = new Chart(chartCanvas.value, {
            type: 'line',
            data: {
                labels: newData.map(d => d.date),
                datasets: [{
                    label: `Nouvelles formations pour "${keywordSearch.value}"`,
                    data: newData.map(d => d.count),
                    borderColor: '#423B71',
                    backgroundColor: 'rgba(66, 59, 113, 0.1)',
                    fill: true,
                    tension: 0.4, 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de nouvelles formations'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Mois de création'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    });
}, { deep: true });

</script>

<template>
  <div class="space-y-8">
    <div class="bg-white p-4 rounded-lg shadow flex flex-wrap items-end gap-4">
      <div class="flex-grow min-w-[250px]">
        <label for="keyword-search" class="label">Analyser la tendance d'un mot-clé</label>
        <input 
          type="text" 
          id="keyword-search" 
          v-model="keywordSearch" 
          class="input-field w-full" 
          placeholder="Ex: Python, Intelligence Artificielle..."
          @keyup.enter="handleSearch"
        >
      </div>
      <button @click="handleSearch" :disabled="marketStore.isLoading" class="btn-primary self-end">
        <span v-if="marketStore.isLoading">Analyse...</span>
        <span v-else>Analyser</span>
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow min-h-[500px] flex flex-col justify-center">
      <h3 class="font-bold mb-4 text-lg text-gray-700">Baromètre du Marché (Évolution sur 24 mois)</h3>
      
      <div v-if="marketStore.isLoading" class="text-center p-8 text-gray-500">
        <p>Analyse des tendances en cours...</p>
      </div>
      
      <div v-else class="relative h-[450px]">
        <canvas ref="chartCanvas"></canvas>
        <div v-if="!marketStore.trendsData.length && !marketStore.isLoading" class="absolute inset-0 flex items-center justify-center text-center text-gray-500">
           <p>Aucune donnée de tendance trouvée.<br>Essayez un autre mot-clé ou une recherche plus large.</p>
        </div>
      </div>
    </div>
  </div>
</template>
