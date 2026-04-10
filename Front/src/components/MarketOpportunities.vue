<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const marketStore = useMarketAnalysisStore();

const filters = ref({
  region: 'Occitanie',
  domain: 'Informatique',
});

const domainsList = ref(['Business', 'Informatique', 'Langues', 'Énergie & Environnement', 'Arts et Design', 'Sciences Humaines']);
const regionsList = ref(['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Ile-De-France', 'Occitanie']);

const handleSearch = () => {
  marketStore.fetchOpportunities(filters.value);
};

const chartData = computed(() => ({
  labels: marketStore.opportunities.map(o => o.intitule_certification),
  datasets: [{
    label: 'Nombre de concurrents',
    backgroundColor: 'rgba(254, 139, 125, 0.7)',
    borderColor: 'rgb(254, 139, 125)',
    borderWidth: 1,
    data: marketStore.opportunities.map(o => o.competitor_count)
  }]
}));

const chartOptions = {
  indexAxis: 'y' as 'y', // Pour un graphique à barres horizontales
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { title: { display: true, text: "Nombre d'organismes de formation concurrents" } } }
};

// La fonction "surprise"
const openPoleEmploiSearch = (romeCode: string, region: string) => {
  if (!romeCode) {
    alert("Aucun code métier (ROME) n'est associé à cette certification.");
    return;
  }
  // On crée une URL qui recherche les offres d'emploi pour ce code ROME et cette région
  const url = `https://candidat.francetravail.fr/offres/recherche?motsCles=${romeCode}&location=${region}&range=0-9&rayon=10`;
  window.open(url, '_blank');
};
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
      <div>
        <label class="label">Domaine</label>
        <select v-model="filters.domain" class="input-field">
          <option v-for="d in domainsList" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
      <div>
        <label class="label">Région</label>
        <select v-model="filters.region" class="input-field">
          <option v-for="r in regionsList" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
      <button @click="handleSearch" class="btn-primary self-end">Trouver les niches</button>
    </div>

    <div v-if="marketStore.isLoading" class="text-center p-8">Analyse en cours...</div>
    <div v-else-if="marketStore.opportunities.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-bold mb-4">Certifications les moins concurrentielles</h3>
        <div class="h-96">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <ul class="divide-y divide-gray-200">
          <li v-for="opp in marketStore.opportunities" :key="opp.intitule_certification" class="py-3">
            <p class="font-semibold">{{ opp.intitule_certification }}</p>
            <div class="flex items-center justify-between mt-2 text-sm">
              <span class="text-gray-600">{{ opp.competitor_count }} concurrent(s)</span>
              <button
                v-if="opp.code_rome"
                @click="openPoleEmploiSearch(opp.code_rome, filters.region)"
                class="btn-text text-blue-600"
                title="Voir les offres d'emploi associées"
              >
                Voir la demande d'emploi ({{ opp.code_rome }})
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>