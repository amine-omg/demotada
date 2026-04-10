<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '/services/api';

type TimeFrame = 'jour' | 'semaine' | 'mois' | 'annee';
const selectedTimeframe = ref<TimeFrame>('mois');
const isLoading = ref(false);
const selectedKpi = ref('inscriptions');

const tunnelStats = ref({
  inscriptions: { value: 0, trend: 0, label: 'Inscriptions', color: 'bg-slate-800' },
  demarrages: { value: 0, trend: 0, label: 'Démarrages', color: 'bg-indigo-600' },
  actifs: { value: 0, trend: 0, label: 'Actifs', color: 'bg-blue-600' },
  termines: { value: 0, trend: 0, label: 'Terminés', color: 'bg-emerald-600' },
  ca: { value: 0, trend: 0, label: 'Chiffre d\'Affaires', color: 'bg-amber-500', isCurrency: true },
});

// Les données exactes découpées par le serveur (ex: [Lun, Mar, Mer...])
const timelineData = ref<{ labels: string[], datasets: any }>({
  labels: [],
  datasets: {}
});

// Le jeu de données à afficher dans le graphique selon le KPI cliqué
const activeDataset = computed(() => {
  const dataArray = timelineData.value.datasets[selectedKpi.value] || [];
  const labels = timelineData.value.labels || [];
  
  return labels.map((label, index) => ({
    label,
    value: dataArray[index] || 0
  }));
});

// Calcul de l'axe Y (Valeur max dynamique pour le graphique)
const maxValue = computed(() => {
  if (activeDataset.value.length === 0) return 100;
  const max = Math.max(...activeDataset.value.map(d => d.value));
  return max > 0 ? Math.ceil(max * 1.2) : 10; // +20% de marge, ou 10 par défaut
});

const yAxisLabels = computed(() => {
  const max = maxValue.value;
  return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0];
});

const fetchPerformanceData = async () => {
  isLoading.value = true;
  try {
    const response = await api.get(`/api/analytics/performance?timeframe=${selectedTimeframe.value}`);
    const data = response.data;
    
    // Remplissage des blocs (Totaux)
    tunnelStats.value.inscriptions.value = data.tunnel.inscriptions.value;
    tunnelStats.value.demarrages.value = data.tunnel.demarrages.value;
    tunnelStats.value.actifs.value = data.tunnel.actifs.value;
    tunnelStats.value.termines.value = data.tunnel.termines.value;
    tunnelStats.value.ca.value = data.tunnel.ca.value;

    // Remplissage des graphiques (Séries temporelles)
    timelineData.value = data.timeline;

  } catch (error) {
    console.error("Erreur lors du chargement des performances", error);
  } finally {
    isLoading.value = false;
  }
};

watch(selectedTimeframe, () => {
    fetchPerformanceData();
});

const formatValue = (val: number, isCurrency: boolean = false) => {
  if (val === undefined || val === null) return '0';
  if (isCurrency) return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  return new Intl.NumberFormat('fr-FR').format(val);
};

onMounted(() => {
  fetchPerformanceData();
});
</script>

<template>
  <div class="w-full flex flex-col gap-6 font-sans text-gray-800">
    
    <div class="bg-white rounded-lg p-6 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-900 tracking-tight">Performances & Conversions</h2>
        <p class="text-xs text-gray-500 mt-1">Analyse détaillée sur la période : <strong>{{ selectedTimeframe }}</strong></p>
      </div>

      <div class="flex bg-gray-100 p-1 rounded-md border border-gray-200">
        <button v-for="tf in ['jour', 'semaine', 'mois', 'annee']" :key="tf"
          @click="selectedTimeframe = tf as TimeFrame"
          :class="[
            'px-4 py-1.5 text-xs font-semibold capitalize transition-colors rounded',
            selectedTimeframe === tf ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tf }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="(kpi, key) in tunnelStats" :key="key" 
             @click="selectedKpi = key"
             :class="[
               'p-4 rounded-lg border cursor-pointer transition-all duration-200 flex flex-col h-28 relative',
               selectedKpi === key ? 'bg-gray-50 border-gray-400 shadow-sm ring-1 ring-gray-400' : 'bg-white border-gray-200 hover:border-gray-300'
             ]">
          
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-gray-500">{{ kpi.label }}</span>
          </div>
          
          <div class="mt-auto flex items-end justify-between">
            <span class="text-2xl font-bold text-gray-900">{{ formatValue(kpi.value, kpi.isCurrency) }}</span>
            <div v-if="selectedKpi === key" :class="['w-2 h-2 rounded-full mb-1.5', kpi.color]"></div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-sm font-bold text-gray-800">Évolution : {{ tunnelStats[selectedKpi as keyof typeof tunnelStats].label }}</h3>
        </div>

        <div class="flex h-72 w-full gap-4">
          <div class="flex flex-col justify-between text-[10px] text-gray-400 font-medium text-right w-12 pb-6">
            <span v-for="label in yAxisLabels" :key="label">{{ formatValue(label, tunnelStats[selectedKpi as keyof typeof tunnelStats].isCurrency) }}</span>
          </div>

          <div class="flex-1 relative flex items-end justify-between border-b border-gray-300 pb-6 pl-2">
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              <div v-for="i in 5" :key="i" class="border-t border-gray-100 w-full h-0"></div>
            </div>

            <div v-for="(point, idx) in activeDataset" :key="idx" 
                 class="relative flex-1 flex justify-center group z-10 h-full items-end">
              
              <div 
                :class="['w-full max-w-[20px] md:max-w-[32px] rounded-t-sm transition-all duration-500 cursor-pointer relative', tunnelStats[selectedKpi as keyof typeof tunnelStats].color]"
                :style="{ height: `${(point.value / maxValue) * 100}%` }"
              >
                <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-md transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  {{ formatValue(point.value, tunnelStats[selectedKpi as keyof typeof tunnelStats].isCurrency) }}
                </div>
              </div>
              
              <span class="absolute -bottom-6 text-[10px] text-gray-500 font-medium whitespace-nowrap">{{ point.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>