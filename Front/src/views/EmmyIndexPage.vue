<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'min-h-screen'" class="w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden overflow-y-hidden relative min-w-0">
    <TheHeader pageTitle="Registre EMMY & Lots PNCEE" :showBackButton="false" class="shrink-0 w-full" />

    <div v-if="isMobile" class="flex-1 flex flex-col overflow-y-auto w-full p-4 pb-20 custom-scrollbar relative min-w-0">
      
      <div class="flex flex-col gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-black text-[#1A1A1A] tracking-tighter mb-1 truncate">Gestion des Lots</h1>
          <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">Historique et dépôts au registre national</p>
        </div>
        
        <button 
          @click="createNewLot" 
          :disabled="isCreating"
          class="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 shrink-0"
          :class="isCreating ? 'bg-gray-200 text-gray-400 cursor-wait' : 'bg-[#1A1A1A] text-[#D4AF37] shadow-[4px_4px_0px_0px_rgba(212,175,55,0.4)]'"
        >
          <span v-if="isCreating" class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
          <svg v-else class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ isCreating ? 'Création en cours...' : 'Créer un nouveau Lot' }}
        </button>
      </div>

      <div class="bg-white rounded-[1.5rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col min-w-0 shrink-0">
        
        <div class="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50 shrink-0 min-w-0">
          <h2 class="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] truncate pr-2">Historique Exports</h2>
          <div class="flex gap-1.5 items-center shrink-0 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-[7px] font-black text-gray-500 uppercase tracking-widest truncate">API EMMY</span>
          </div>
        </div>

        <div v-if="isLoading" class="p-10 flex flex-col items-center justify-center shrink-0">
          <div class="w-8 h-8 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-3"></div>
          <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">Chargement...</span>
        </div>

        <div v-else class="flex flex-col divide-y divide-gray-100 shrink-0 min-w-0">
          
          <div v-for="lot in lots" :key="lot._id" 
               class="p-4 flex flex-col gap-3 transition-colors relative min-w-0" 
               :class="lot.status === 'draft' ? 'bg-[#D4AF37]/5' : 'bg-white'">
            
            <div class="flex justify-between items-start w-full min-w-0 gap-2">
              <div class="min-w-0 flex-1">
                <span class="font-black text-[#1A1A1A] text-sm md:text-base truncate block">{{ lot.reference }}</span>
                <span class="block text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 truncate">{{ lot.dossierCount }} Dossiers inclus</span>
                <span class="block text-[10px] font-bold text-gray-600 mt-1 truncate">{{ formatDate(lot.createdAt) }}</span>
              </div>
              
              <span v-if="lot.status === 'draft'" class="shrink-0 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[8px] font-black uppercase tracking-widest self-start">
                Brouillon
              </span>
              <span v-else class="shrink-0 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 self-start">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                Validé EMMY
              </span>
            </div>

            <div class="flex items-center justify-between mt-1 pt-3 border-t border-black/5 w-full min-w-0 gap-3">
              <div class="flex flex-col min-w-0">
                <span class="text-[7px] font-black text-gray-400 uppercase tracking-widest truncate">Volume</span>
                <span class="font-mono text-sm font-black text-[#1A1A1A] truncate">{{ lot.volumeGwh }} <span class="text-[9px] font-sans">GWh</span></span>
              </div>
              
              <button v-if="lot.status === 'draft'" @click="$router.push(`/emmy-export/${lot._id}`)" class="shrink-0 px-4 py-2.5 bg-[#1A1A1A] text-[#D4AF37] hover:bg-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_0px_rgba(212,175,55,0.4)] active:translate-y-0.5 transition-transform">
                Préparer
              </button>
              <button v-else class="shrink-0 px-4 py-2.5 text-gray-500 bg-white border-2 border-gray-200 hover:bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm active:translate-y-0.5 transition-transform">
                ZIP
              </button>
            </div>

          </div>

          <div v-if="lots.length === 0" class="p-8 text-center">
            <span class="text-4xl mb-3 block opacity-20">📦</span>
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Aucun lot disponible</span>
          </div>

        </div>
      </div>
    </div>


    <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 w-full min-w-0">
      
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

      <div class="bg-white rounded-[2rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden w-full">
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

        <div v-else class="w-full overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[800px]">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api';
import TheHeader from '../components/TheHeader.vue';

const router = useRouter();

// ---- GESTION DU RESPONSIVE (Render Adaptatif) ----
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // 768px = point de bascule standard tablette/mobile
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchLots();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
// ----------------------------------------------------

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

const createNewLot = async () => {
  isCreating.value = true;
  try {
    await api.post('/api/demo/lots');
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
/* Scrollbar custom commune aux deux vues */
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
</style>