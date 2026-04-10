<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const marketStore = useMarketAnalysisStore();
const keywordSearch = ref('Rénovation énergétique');
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const handleSearch = () => {
  if (keywordSearch.value) {
    marketStore.fetchTopCertifications(keywordSearch.value);
  }
};

const truncateLabel = (label: string, maxLength = 50) => {
    if (label.length > maxLength) {
        return label.substring(0, maxLength) + '...';
    }
    return label;
};

watch(() => marketStore.topCertificationsData, (newData) => {
    nextTick(() => {
        if (!chartCanvas.value) return;

        if (chartInstance) {
            chartInstance.destroy();
        }

        if (!newData || newData.length === 0) return;

        const reversedData = [...newData].reverse();

        chartInstance = new Chart(chartCanvas.value, {
            type: 'bar',
            data: {
                labels: reversedData.map(d => truncateLabel(d.intitule_certification)),
                datasets: [{
                    label: 'Nombre de formations associées',
                    data: reversedData.map(d => d.count),
                    backgroundColor: [
                        'rgba(66, 59, 113, 0.7)',
                        'rgba(254, 139, 125, 0.7)',
                        'rgba(178, 233, 225, 0.7)',
                        'rgba(107, 114, 128, 0.7)',
                        'rgba(249, 168, 37, 0.7)',
                        'rgba(194, 24, 91, 0.7)',
                    ],
                    borderColor: [
                        '#423B71',
                        '#FE8B7D',
                        '#B2E9E1',
                        '#6B7280',
                        '#F9A825',
                        '#C2185B',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', 
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de formations'
                        }
                    },
                    y: {
                       ticks: {
                           autoSkip: false 
                       }
                    }
                },
                plugins: {
                    legend: {
                        display: false 
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                const index = tooltipItems[0].dataIndex;
                                return reversedData[index].intitule_certification;
                            }
                        }
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
        <label for="keyword-search" class="label">Analyser un mot-clé</label>
        <input 
          type="text" 
          id="keyword-search" 
          v-model="keywordSearch" 
          class="input-field w-full" 
          placeholder="Ex: Python, Vente, Management..."
          @keyup.enter="handleSearch"
        >
      </div>
      <button @click="handleSearch" :disabled="marketStore.isLoading" class="btn-primary self-end">
        <span v-if="marketStore.isLoading">Analyse...</span>
        <span v-else>Analyser</span>
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow min-h-[500px] flex flex-col justify-center">
      <h3 class="font-bold mb-4 text-lg text-gray-700">Top 10 des Certifications Associées</h3>
      
      <div v-if="marketStore.isLoading" class="text-center p-8 text-gray-500">
        <p>Recherche des certifications en cours...</p>
      </div>
      
      <div v-else class="relative h-[450px]">
        <canvas ref="chartCanvas"></canvas>
        <div v-if="!marketStore.topCertificationsData.length && !marketStore.isLoading" class="absolute inset-0 flex items-center justify-center text-center text-gray-500">
           <p>Aucune certification trouvée pour ce mot-clé.<br>Essayez une recherche plus large.</p>
        </div>
      </div>
    </div>
  </div>
</template>
