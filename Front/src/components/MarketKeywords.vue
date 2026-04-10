<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'; 
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';
import { Chart } from 'chart.js';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

Chart.register(WordCloudController, WordElement);

const marketStore = useMarketAnalysisStore();
const certificationSearch = ref('Titre Professionnel Développeur Web et Web Mobile');

const wordCloudCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const handleSearch = () => {
  if (certificationSearch.value) {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    marketStore.fetchKeywords(certificationSearch.value);
  }
};

const chartOptions = {
  elements: {
    word: {
      color: (context: any) => {
          const colors = ['#FE8B7D', '#423B71', '#B2E9E1', '#6B7280', '#9A3412', '#F9A825', '#C2185B'];
          return colors[context.dataIndex % colors.length];
      },
      hoverColor: 'black',
    },
  },
  plugins: { 
      legend: { display: false } 
  },
  responsive: true,
  maintainAspectRatio: false,
};

watch(() => marketStore.keywords, (newKeywords) => {
  nextTick(() => {
    if (!wordCloudCanvas.value) {
        return; 
    }

    if (chartInstance) {
      chartInstance.destroy();
    }

    if (newKeywords && newKeywords.length > 0) {
      chartInstance = new Chart(wordCloudCanvas.value, {
        type: 'wordCloud',
        data: {
          labels: newKeywords.map(k => k.text),
          datasets: [{
            label: 'Mots-clés',
            data: newKeywords.map(k => k.value), 
            fit: true,
          }]
        },
        options: chartOptions,
      });
    }
  });
}, { deep: true });

</script>

<template>
  <div class="space-y-8">
    <div class="bg-white p-4 rounded-lg shadow flex flex-wrap items-end gap-4">
      <div class="flex-grow min-w-[250px]">
        <label for="certif-search" class="label">Analyser une certification</label>
        <input 
          type="text" 
          id="certif-search" 
          v-model="certificationSearch" 
          class="input-field w-full" 
          placeholder="Ex: Titre Pro Développeur Web, Excel, Management..."
          @keyup.enter="handleSearch"
        >
      </div>
      <button @click="handleSearch" :disabled="marketStore.isLoading" class="btn-primary self-end">
        <span v-if="marketStore.isLoading">Analyse...</span>
        <span v-else>Analyser</span>
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow min-h-[450px] flex flex-col justify-center">
      <h3 class="font-bold mb-4 text-lg text-gray-700">Radar de Contenu : Mots-clés les plus fréquents</h3>
      
      <div v-if="marketStore.isLoading" class="text-center p-8 text-gray-500">
        <p>Analyse en cours...</p>
      </div>
      
      <div v-else class="relative h-96">
        <canvas ref="wordCloudCanvas"></canvas>
        <div v-if="!marketStore.keywords.length && !marketStore.isLoading" class="absolute inset-0 flex items-center justify-center text-center text-gray-500">
           <p>Aucune donnée à afficher.<br>Lancez une analyse pour générer le nuage de mots.</p>
        </div>
      </div>
    </div>
  </div>
</template>
