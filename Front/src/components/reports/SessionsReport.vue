<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '/services/api';

const isLoading = ref(false);

const kpis = ref({
  actives: { label: 'Sessions Actives', value: 0 },
  apprenants: { label: 'Apprenants Déployés', value: 0 },
  completion: { label: 'Complétion Moyenne', value: 0 },
  aVenir: { label: 'Démarrages à venir', value: 0 }
});

const distribution = ref({ actives: 0, aVenir: 0, terminees: 0 });
const topSessions = ref<any[]>([]);

const fetchSessionsData = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/api/analytics/sessions');
    const data = response.data;
    
    kpis.value.actives.value = data.kpis.actives;
    kpis.value.apprenants.value = data.kpis.apprenants;
    kpis.value.completion.value = data.kpis.completion;
    kpis.value.aVenir.value = data.kpis.aVenir;

    distribution.value = data.distribution;
    topSessions.value = data.topSessions;

  } catch (error) {
    console.error("Erreur chargement rapports sessions:", error);
  } finally {
    isLoading.value = false;
  }
};

const totalPortfolio = computed(() => distribution.value.actives + distribution.value.aVenir + distribution.value.terminees);
const getPercent = (val: number) => totalPortfolio.value > 0 ? (val / totalPortfolio.value) * 100 : 0;

const getProgressBarColor = (progression: number) => {
  if (progression < 25) return 'bg-red-500';
  if (progression < 75) return 'bg-indigo-500';
  return 'bg-emerald-500';
};

onMounted(() => {
  fetchSessionsData();
});
</script>

<template>
  <div class="w-full flex flex-col gap-6 font-sans text-gray-800">
    
    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h2 class="text-xl font-bold text-gray-900 tracking-tight">Tour de Contrôle Opérationnelle</h2>
      <p class="text-xs text-gray-500 mt-1">Analyse des cohortes en temps réel</p>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="(kpi, key) in kpis" :key="key" class="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 mb-2">{{ kpi.label }}</p>
          <p class="text-3xl font-bold text-gray-900">
            {{ kpi.value }}<span v-if="key === 'completion'" class="text-lg text-gray-400 ml-1">%</span>
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 class="text-sm font-bold text-gray-800 mb-6">Suivi des Cohortes Actives (Top 5)</h3>
          
          <div class="flex flex-col gap-3">
            <div v-for="session in topSessions" :key="session.id" class="p-4 rounded border border-gray-200 bg-gray-50">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-bold text-sm text-gray-900">{{ session.nom }}</h4>
                  <p class="text-[10px] font-medium text-gray-500 mt-0.5">{{ session.apprenants }} apprenants | Fin : {{ session.fin }}</p>
                </div>
                <span class="text-xs font-bold text-gray-700">{{ session.progression }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div :class="['h-full rounded-full transition-all', getProgressBarColor(session.progression)]" :style="{ width: `${session.progression}%` }"></div>
              </div>
            </div>
            
            <div v-if="topSessions.length === 0" class="text-center py-10 text-gray-400 text-sm">Aucune session active.</div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 class="text-sm font-bold text-gray-800 mb-6">État du Portefeuille</h3>
          
          <div class="w-full h-4 rounded overflow-hidden flex mb-6 shadow-inner bg-gray-100">
            <div class="h-full bg-emerald-500" :style="{ width: `${getPercent(distribution.actives)}%` }"></div>
            <div class="h-full bg-amber-400" :style="{ width: `${getPercent(distribution.aVenir)}%` }"></div>
            <div class="h-full bg-gray-400" :style="{ width: `${getPercent(distribution.terminees)}%` }"></div>
          </div>

          <div class="space-y-4 text-sm font-medium">
            <div class="flex justify-between items-center text-gray-700">
              <div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> En cours</div>
              <span>{{ distribution.actives }}</span>
            </div>
            <div class="flex justify-between items-center text-gray-700">
              <div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div> À venir</div>
              <span>{{ distribution.aVenir }}</span>
            </div>
            <div class="flex justify-between items-center text-gray-700">
              <div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-gray-400"></div> Clôturées</div>
              <span>{{ distribution.terminees }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>