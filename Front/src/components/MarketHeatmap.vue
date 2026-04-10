<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';
import { Chart } from 'chart.js';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo';

Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

const marketStore = useMarketAnalysisStore();
const keywordSearch = ref('Rénovation énergétique');
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
let franceGeoData: any = null; 

const handleSearch = () => {
  if (keywordSearch.value) {
    marketStore.fetchHeatmapData(keywordSearch.value);
  }
};

const renderMap = () => {
    if (!chartCanvas.value || !franceGeoData) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const departments = franceGeoData.features;
    
    const dataValues = marketStore.heatmapData;

    const maxCount = dataValues.length > 0 ? Math.max(...dataValues.map(d => d.count), 1) : 1;

    chartInstance = new Chart(chartCanvas.value.getContext('2d')!, {
        type: 'choropleth',
        data: {
            labels: departments.map((d: any) => d.properties.nom),
            datasets: [{
                label: 'Concurrents',
                outline: departments,
                data: departments.map((d: any) => ({
                    feature: d,
                    value: dataValues.find(v => v.nom_departement === d.properties.nom)?.count || 0
                })),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const item = context.dataset.data[context.dataIndex];
                            return `${item.feature.properties.nom}: ${item.value} concurrent(s)`;
                        }
                    }
                }
            },
            scales: {
                projection: {
                    axis: 'x',
                    projection: 'mercator',
                },
                color: {
                    axis: 'y',
                    domain: [0, maxCount],
                    interpolate: (value) => {
                        const t = Math.max(0, Math.min(1, value || 0));

                        const green = { r: 237, g: 247, b: 238 };
                        const yellow = { r: 255, g: 240, b: 160 };
                        const red = { r: 254, g: 139, b: 125 };

                        let color;
                        if (t < 0.5) {
                            const p = t * 2;
                            color = {
                                r: green.r + (yellow.r - green.r) * p,
                                g: green.g + (yellow.g - green.g) * p,
                                b: green.b + (yellow.b - green.b) * p,
                            };
                        } else {
                            const p = (t - 0.5) * 2;
                            color = {
                                r: yellow.r + (red.r - yellow.r) * p,
                                g: yellow.g + (red.g - yellow.g) * p,
                                b: yellow.b + (red.b - yellow.b) * p,
                            };
                        }
                        return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
                    },
                    legend: {
                        position: 'bottom-right',
                        title: {
                            display: true,
                            text: 'Densité de concurrence'
                        }
                    }
                }
            }
        }
    });
};


onMounted(async () => {
    try {
        const response = await fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson');
        franceGeoData = await response.json();
        renderMap(); 
    } catch (error) {
        console.error("Impossible de charger les données de la carte de France", error);
    }
});

watch(() => marketStore.heatmapData, () => {
    nextTick(() => {
        renderMap();
    });
}, { deep: true });

</script>

<template>
  <div class="space-y-8">
    <div class="bg-white p-4 rounded-lg shadow flex flex-wrap items-end gap-4">
      <div class="flex-grow min-w-[250px]">
        <label for="keyword-search" class="label">Analyser un mot-clé de formation</label>
        <input 
          type="text" 
          id="keyword-search" 
          v-model="keywordSearch" 
          class="input-field w-full" 
          placeholder="Ex: Rénovation énergétique, Excel, Vente..."
          @keyup.enter="handleSearch"
        >
      </div>
      <button @click="handleSearch" :disabled="marketStore.isLoading" class="btn-primary self-end">
        <span v-if="marketStore.isLoading">Analyse...</span>
        <span v-else>Scanner</span>
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow min-h-[500px] flex flex-col justify-center">
      <h3 class="font-bold mb-4 text-lg text-gray-700">Scanner Géographique de la Concurrence</h3>
      
      <div v-if="marketStore.isLoading" class="text-center p-8 text-gray-500">
        <p>Analyse en cours...</p>
      </div>
      
      <div v-else class="relative h-[550px]">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>
