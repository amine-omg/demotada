<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(...registerables, annotationPlugin);

const marketStore = useMarketAnalysisStore();
const certificationSearch = ref('Titre Professionnel Développeur Web et Web Mobile');

const myPrice = ref<number | null>(null);
const myDuration = ref<number | null>(null);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const handleSearch = () => {
  if (certificationSearch.value) {
    marketStore.fetchPricingStats(certificationSearch.value);
  }
};

const chartData = computed(() => {
    const data = {
        datasets: [
            {
                label: 'Concurrents',
                data: marketStore.pricingChartData.map(p => ({
                    x: p.nombre_heures_total_mean,
                    y: p.frais_ttc_tot_mean
                })),
                backgroundColor: 'rgba(107, 114, 128, 0.5)', // Gris
                pointRadius: 5,
            }
        ]
    };

    if (myPrice.value !== null && myDuration.value !== null) {
        data.datasets.push({
            label: 'Mon Positionnement',
            data: [{ x: myDuration.value, y: myPrice.value }],
            backgroundColor: '#FE8B7D', // Couleur Syali
            pointRadius: 8,
            pointStyle: 'star',
        });
    }
    return data;
});

watch([() => marketStore.pricingChartData, myPrice, myDuration], () => {
    nextTick(() => {
        if (!chartCanvas.value) return;
        
        const stats = marketStore.pricingStats;

        if (chartInstance) {
            chartInstance.destroy();
        }
        
        if (!stats) return;

        chartInstance = new Chart(chartCanvas.value, {
            type: 'scatter',
            data: chartData.value,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Durée en Heures' }
                    },
                    y: {
                        title: { display: true, text: 'Prix en €' }
                    }
                },
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += `(${context.parsed.x}h, ${context.parsed.y}€)`;
                                return label;
                            }
                        }
                    },
                    // Configuration des annotations pour les quadrants
                    annotation: {
                        annotations: {
                            medianPriceLine: {
                                type: 'line',
                                yMin: stats.prix_median,
                                yMax: stats.prix_median,
                                borderColor: 'rgba(254, 139, 125, 0.7)',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    content: `Prix Médian: ${stats.prix_median.toFixed(2)}€`,
                                    display: true,
                                    position: 'start',
                                    backgroundColor: 'rgba(254, 139, 125, 0.7)',
                                    font: { size: 10 }
                                }
                            },
                            medianDurationLine: {
                                type: 'line',
                                xMin: stats.duree_mediane,
                                xMax: stats.duree_mediane,
                                borderColor: 'rgba(66, 59, 113, 0.7)',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    content: `Durée Médiane: ${stats.duree_mediane.toFixed(0)}h`,
                                    display: true,
                                    position: 'start',
                                    backgroundColor: 'rgba(66, 59, 113, 0.7)',
                                    font: { size: 10 }
                                }
                            },
                            // Labels pour les quadrants
                            premium: { type: 'label', xValue: stats.duree_mediane * 0.1, yValue: stats.prix_max * 0.9, content: ['Premium', 'Intensif'], font: {size: 14, weight: 'bold'}, color: 'rgba(0,0,0,0.2)' },
                            hautDeGamme: { type: 'label', xValue: stats.duree_mediane * 1.8, yValue: stats.prix_max * 0.9, content: ['Haut de Gamme', 'Complet'], font: {size: 14, weight: 'bold'}, color: 'rgba(0,0,0,0.2)' },
                            entreeDeGamme: { type: 'label', xValue: stats.duree_mediane * 0.1, yValue: stats.prix_median * 0.1, content: ['Entrée de Gamme', 'Initiation'], font: {size: 14, weight: 'bold'}, color: 'rgba(0,0,0,0.2)' },
                            bonMarche: { type: 'label', xValue: stats.duree_mediane * 1.8, yValue: stats.prix_median * 0.1, content: ['Bon Marché', 'Long Format'], font: {size: 14, weight: 'bold'}, color: 'rgba(0,0,0,0.2)' },
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
    <!-- Section des filtres -->
    <div class="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div class="md:col-span-3">
        <label for="certif-search" class="label">Analyser une certification</label>
        <div class="flex items-center gap-2">
            <input 
              type="text" 
              id="certif-search" 
              v-model="certificationSearch" 
              class="input-field w-full" 
              placeholder="Ex: Titre Pro Développeur Web..."
              @keyup.enter="handleSearch"
            >
            <button @click="handleSearch" :disabled="marketStore.isLoading" class="btn-primary">
              <span v-if="marketStore.isLoading">Analyse...</span>
              <span v-else>Analyser</span>
            </button>
        </div>
      </div>
      
      <!-- Inputs pour le positionnement de l'utilisateur -->
      <div class="border-t pt-4 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <h3 class="md:col-span-3 font-semibold text-gray-600">Simulez votre positionnement :</h3>
          <div>
              <label for="my-price" class="label">Votre Prix (€)</label>
              <input type="number" id="my-price" v-model.number="myPrice" class="input-field w-full" placeholder="Ex: 3500">
          </div>
          <div>
              <label for="my-duration" class="label">Votre Durée (heures)</label>
              <input type="number" id="my-duration" v-model.number="myDuration" class="input-field w-full" placeholder="Ex: 450">
          </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow min-h-[500px] flex flex-col justify-center">
      <h3 class="font-bold mb-4 text-lg text-gray-700">GPS de Positionnement (Prix vs. Durée)</h3>
      
      <div v-if="marketStore.isLoading" class="text-center p-8 text-gray-500">
        <p>Analyse en cours...</p>
      </div>
      
      <div v-else class="relative h-[450px]">
        <canvas ref="chartCanvas"></canvas>
        <div v-if="!marketStore.pricingChartData.length && !marketStore.isLoading" class="absolute inset-0 flex items-center justify-center text-center text-gray-500">
           <p>Aucune donnée à afficher.<br>Lancez une analyse pour générer la cartographie.</p>
        </div>
      </div>
    </div>
  </div>
</template>
