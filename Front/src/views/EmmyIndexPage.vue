<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-hidden">
    <TheHeader pageTitle="Registre EMMY & Lots PNCEE" :showBackButton="false" />

    <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
      
      <div class="flex justify-between items-end mb-10">
        <div>
          <h1 class="text-3xl font-black text-[#1A1A1A] tracking-tighter mb-2">Gestion des Lots</h1>
          <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">Historique et dépôts au registre national</p>
        </div>
        
        <button 
          @click="createNewLot" 
          :disabled="isCreating"
          class="px-6 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center gap-3"
          :class="isCreating ? 'bg-gray-200 text-gray-400 cursor-wait' : 'bg-[#1A1A1A] hover:bg-black text-[#D4AF37] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]'"
        >
          <span v-if="isCreating" class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ isCreating ? 'Création en cours...' : 'Créer un nouveau Lot' }}
        </button>
      </div>

      <div class="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Historique des Exports</h2>
          <div class="flex gap-2 items-center">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Connecté API EMMY</span>
          </div>
        </div>

        <div v-if="isLoading" class="p-10 text-center">
          <div class="w-8 h-8 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
        </div>

        <div v-else class="w-full overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white border-b border-gray-100">
                <th class="p-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Réf. Lot</th>
                <th class="p-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Création</th>
                <th class="p-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Volume (GWh)</th>
                <th class="p-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                <th class="p-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              
              <tr v-for="lot in lots" :key="lot._id" class="transition-colors group" :class="lot.status === 'draft' ? 'bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10' : 'hover:bg-gray-50'">
                <td class="p-5">
                  <span class="font-black text-[#1A1A1A] text-sm">{{ lot.reference }}</span>
                  <span class="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{{ lot.dossierCount }} Dossiers inclus</span>
                </td>
                <td class="p-5 text-xs font-bold text-gray-600">{{ formatDate(lot.createdAt) }}</td>
                <td class="p-5 font-mono text-sm font-bold text-[#1A1A1A]">{{ lot.volumeGwh }}</td>
                <td class="p-5">
                  <span v-if="lot.status === 'draft'" class="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Brouillon
                  </span>
                  <span v-else class="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-2">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    Validé EMMY
                  </span>
                </td>
                <td class="p-5 text-right">
                  <button v-if="lot.status === 'draft'" @click="$router.push(`/emmy-export/${lot._id}`)" class="px-6 py-2.5 bg-[#1A1A1A] text-[#D4AF37] hover:bg-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm transition-transform hover:scale-105">
                    Préparer
                  </button>
                  <button v-else class="px-4 py-2 text-gray-400 hover:text-[#1A1A1A] bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all">
                    Télécharger ZIP
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api';
import TheHeader from '../components/TheHeader.vue';

const router = useRouter();
const lots = ref([]);
const isLoading = ref(true);
const isCreating = ref(false);

const fetchLots = async () => {
  try {
    const res = await api.get('/api/demo/lots');
    lots.value = res.data.data;
  } catch (error) {
    console.error("Erreur de récupération des lots:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLots();
});

const createNewLot = async () => {
  isCreating.value = true;
  try {
    // Appel à la nouvelle route backend
    await api.post('/api/demo/lots');
    // Rafraîchissement de la liste pour faire apparaître le nouveau lot
    await fetchLots();
  } catch (error) {
    console.error("Erreur lors de la création du lot:", error);
    alert("Impossible de créer un nouveau lot.");
  } finally {
    isCreating.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
</style>