<template>
  <div class="w-full bg-gray-50 min-h-screen font-sans">
    
    <div class="bg-[#423B71] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl mb-8 w-full">
      <div class="flex items-center gap-6">
        <button @click="$emit('back')" class="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/20 shadow-inner">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2 class="text-3xl font-black uppercase tracking-tight">Audit : {{ typeLabel }}</h2>
          <p class="text-white/60 text-xs font-black uppercase tracking-[0.2em] mt-1">Données collectées en temps réel</p>
        </div>
      </div>
      <div class="flex items-center gap-5">
        <div class="bg-white/10 px-8 py-3 rounded-2xl border border-white/10 text-center shadow-inner">
          <p class="text-[9px] font-black uppercase opacity-60 tracking-widest">Moyenne Formation</p>
          <p class="text-2xl font-black">{{ globalAverage }}%</p>
        </div>
        <button @click="downloadCSV" class="bg-white/10 text-white border border-white/20 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
          <i class="fas fa-file-csv"></i> CSV
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-8">
      <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[450px]">
        <h3 class="text-xl font-black text-[#423B71] mb-10 uppercase tracking-widest flex items-center gap-3">
          <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span> Radar de Compétences
        </h3>
        <div v-if="categoryStats.length > 0" class="h-[350px]">
           <RadarChart :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="flex flex-col items-center justify-center h-[350px] bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-300 font-black uppercase text-xs">
          <i class="fas fa-chart-radar text-5xl mb-4 opacity-20"></i>
          Données insuffisantes
        </div>
      </div>

      <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 class="text-xl font-black text-[#423B71] mb-10 uppercase tracking-widest flex items-center gap-3">
           <span class="w-1.5 h-6 bg-purple-500 rounded-full"></span> Détails par thématique
        </h3>
        <div v-if="categoryStats.length > 0" class="space-y-8">
          <div v-for="item in categoryStats" :key="item.category" class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="font-black text-gray-700 uppercase tracking-wide text-xs">{{ item.category }}</span>
              <span class="text-indigo-600 font-black bg-indigo-50 px-3 py-1 rounded-lg text-xs">{{ item.score }}%</span>
            </div>
            <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-50">
              <div class="h-full transition-all duration-1000 bg-indigo-400" :style="{ width: item.score + '%' }"></div>
            </div>
            <p class="text-[9px] text-gray-400 font-black uppercase tracking-widest">Basé sur {{ item.totalQuestions }} question(s)</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden w-full">
      <div class="p-8 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <h3 class="text-2xl font-black text-[#423B71] uppercase tracking-tighter">Résultats Apprenants</h3>
        <div class="relative w-full lg:w-96">
          <i class="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <input v-model="searchQuery" type="text" placeholder="Rechercher..." class="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm shadow-inner transition-all">
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50/50">
            <tr>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Apprenant</th>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Score Global</th>
              <th class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="res in filteredResults" :key="res._id" class="hover:bg-indigo-50/20 transition-all group">
              <td class="px-8 py-6">
  <div class="flex items-center gap-5">
    <div class="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shadow-sm border-2 border-white">
      {{ res.student?.prenom?.charAt(0) }}{{ res.student?.nom?.charAt(0) }}
    </div>
    <div class="flex flex-col">
      <span class="text-sm font-black text-gray-900 leading-none">
        {{ res.student?.prenom }} {{ res.student?.nom }}
      </span>
      <span class="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
        {{ res.student?.email }}
      </span>
    </div>
  </div>
</td>
              <td class="px-8 py-6">
                <span :class="['px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest', res.globalScore >= 75 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200']">{{ res.globalScore }}%</span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end gap-3">
                  <button @click="handleDownloadPDF(res)" class="px-4 py-2 bg-[#423B71] text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all shadow-md flex items-center gap-2">
                    <i class="fas fa-file-pdf"></i> BILAN PDF
                  </button>
                  <button @click="selectedCopy = res" class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><i class="fas fa-eye"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '/services/api';
import { Radar as RadarChart } from 'vue-chartjs';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

// 1. Import de l'utilitaire centralisé pour le PDF
import { generateBilanPDF } from '../utils/pdfGenerator';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = defineProps<{ formationId: string; type: string; }>();
const emit = defineEmits(['back']);

const categoryStats = ref<any[]>([]);
const individualResults = ref<any[]>([]);
const formationInfo = ref<any>(null);
const selectedCopy = ref<any>(null);
const searchQuery = ref('');

const typeLabel = computed(() => {
  if (props.type === 'positioning') return 'Positionnement';
  if (props.type === 'satisfaction_chaud') return 'Satisfaction Chaud';
  return 'Satisfaction Froid';
});

const chartData = computed(() => {
  if (!categoryStats.value || categoryStats.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  return {
    labels: categoryStats.value.map(s => s.category || 'Compétence'),
    datasets: [{
      label: 'Maîtrise %',
      data: categoryStats.value.map(s => s.score || 0),
      backgroundColor: 'rgba(135, 110, 200, 0.2)',
      borderColor: '#876EC8',
      pointBackgroundColor: '#876EC8',
      borderWidth: 3
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } },
  plugins: { legend: { display: false } }
};

const fetchData = async () => {
  try {
    const [statsRes, indRes, formRes] = await Promise.all([
      api.get(`/api/evaluations/${props.formationId}/stats/${props.type}`),
      api.get(`/api/user-evaluations/${props.formationId}/stats/${props.type}`),
      api.get(`/api/formations/${props.formationId}`)
    ]);
    categoryStats.value = statsRes.data || [];
    individualResults.value = indRes.data || [];
    formationInfo.value = formRes.data;
  } catch (err) {
    console.error("Erreur audit:", err);
  }
};

// 2. Pont vers le générateur PDF centralisé (Remplace l'usine à gaz d'avant)
const handleDownloadPDF = async (result: any) => {
  if (!formationInfo.value) {
    alert("Les informations de la formation sont en cours de chargement...");
    return;
  }

  // On enrichit l'objet avec le titre de la formation
  const enrichedResult = {
    ...result,
    formationTitle: formationInfo.value.title
  };

  // On détermine le titre légal exact
  const docTitle = props.type === 'positioning' ? 'TEST DE POSITIONNEMENT' : 
                   props.type === 'satisfaction_chaud' ? 'QUESTIONNAIRE DE SATISFACTION (À CHAUD)' :
                   'QUESTIONNAIRE DE SATISFACTION (À FROID)';

  // Appel propre à l'utilitaire
  await generateBilanPDF(enrichedResult, formationInfo.value.ecole, docTitle);
};

const deleteResult = async (id: string) => {
  if (confirm("Supprimer définitivement cette copie ?")) {
    try {
      await api.delete(`/api/user-evaluations/${id}`);
      await fetchData();
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  }
};

// 3. FIX ZERO RÉGRESSION : Ajout de nom/prenom pour la recherche
const filteredResults = computed(() => {
  if (!searchQuery.value.trim()) return individualResults.value;
  const q = searchQuery.value.toLowerCase();
  return individualResults.value.filter(r => 
    r.student?.nom?.toLowerCase().includes(q) || 
    r.student?.prenom?.toLowerCase().includes(q) || 
    r.student?.email?.toLowerCase().includes(q) ||
    // Gardé par sécurité au cas où de vieux documents auraient ces champs
    r.student?.firstName?.toLowerCase().includes(q) || 
    r.student?.lastName?.toLowerCase().includes(q) 
  );
});

const globalAverage = computed(() => {
  if (filteredResults.value.length === 0) return 0;
  const sum = filteredResults.value.reduce((acc, curr) => acc + (curr.globalScore || 0), 0);
  return Math.round(sum / filteredResults.value.length);
});

onMounted(fetchData);
</script>