<template>
  <div class="h-[100dvh] w-full bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-hidden relative min-w-0">
    
    <TheHeader pageTitle="Pipeline Dossiers" :showBackButton="false" class="w-full shrink-0 border-b-2 border-black z-30" />

    <div class="w-full px-4 md:px-8 py-3 md:py-4 bg-white border-b-2 border-black shrink-0 flex justify-between items-center z-20 gap-3">
      <div class="flex items-center gap-4 md:gap-6 text-left min-w-0">
        <div class="truncate">
          <h1 class="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none truncate">Flux Opérationnel</h1>
          <p class="text-[8px] md:text-[9px] text-[#D4AF37] font-black uppercase tracking-widest mt-0.5 md:mt-1 truncate">Navigation par carrousel</p>
        </div>
        
        <div class="hidden md:flex items-center gap-2 bg-gray-50 p-1 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shrink-0">
          <button @click="scrollBoard('left')" class="p-1.5 hover:bg-black hover:text-[#D4AF37] rounded-lg transition-all active:translate-y-0.5">
            <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M9 5l7 7-7 7"/></svg>
          </button>
          <div class="w-px h-4 bg-black/10"></div>
          <button @click="scrollBoard('right')" class="p-1.5 hover:bg-black hover:text-[#D4AF37] rounded-lg transition-all active:translate-y-0.5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <button @click="showModal = true" class="shrink-0 bg-black text-[#D4AF37] px-3 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:scale-95">
        + <span class="hidden sm:inline">Nouveau Dossier</span><span class="sm:hidden">Nouveau</span>
      </button>
    </div>

    <div class="flex-1 w-full min-h-0 relative bg-[#F8F9FA] z-10">
      <div 
        ref="boardContainer" 
        class="absolute inset-0 overflow-x-auto overflow-y-hidden scroll-smooth hide-scrollbar flex gap-4 md:gap-8 p-4 md:p-8 items-start snap-x snap-mandatory md:snap-none"
      >
        <div v-for="(stage, index) in stages" :key="stage.id" 
             class="w-[85vw] sm:w-[320px] md:w-[360px] h-full flex flex-col shrink-0 bg-white border-2 border-black rounded-[2rem] md:rounded-[2.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden snap-center md:snap-align-none">
          
          <div class="p-4 md:p-5 border-b-2 border-black flex items-center justify-between shrink-0" :style="{ backgroundColor: stage.color + '15' }">
            <div class="flex items-center gap-2 md:gap-3">
              <div class="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-black shadow-inner shrink-0" :style="{ backgroundColor: stage.color }"></div>
              <h2 class="font-black text-[10px] md:text-xs uppercase tracking-widest text-[#1A1A1A] truncate">{{ stage.label }}</h2>
            </div>
            <span class="bg-black text-white px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-[9px] md:text-[10px] font-black shrink-0">
              {{ dossiersByStatus[stage.id]?.length || 0 }}
            </span>
          </div>

          <div class="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-5 custom-scrollbar-v bg-gray-50/10 pb-20">
            <PipelineCard 
              v-for="dossier in dossiersByStatus[stage.id]" 
              :key="dossier._id" 
              :dossier="dossier" 
              :canMoveLeft="index > 0"
              :canMoveRight="index < stages.length - 1"
              @moveLeft="moveDossier(dossier, 'left')"
              @moveRight="moveDossier(dossier, 'right')"
              @click="goToDossier(dossier._id)"
            />
            <div v-if="dossiersByStatus[stage.id]?.length === 0" class="h-24 md:h-32 border-2 border-dashed border-gray-200 rounded-[1.5rem] md:rounded-2xl flex items-center justify-center opacity-40">
               <span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Vide</span>
            </div>
          </div>

        </div>

        <div class="w-4 md:hidden shrink-0"></div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-white w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] shadow-[10px_10px_0px_0px_rgba(212,175,55,1)] md:shadow-[15px_15px_0px_0px_rgba(212,175,55,1)] overflow-hidden border-2 border-black flex flex-col max-h-[90vh]">
          
          <div class="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
            <h2 class="text-lg md:text-xl font-black text-[#1A1A1A] uppercase tracking-tighter truncate pr-4">Initialisation Manuelle</h2>
            <button @click="showModal = false" class="text-gray-400 hover:text-black transition-colors text-3xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0">&times;</button>
          </div>
          
          <div class="p-6 md:p-8 space-y-4 md:space-y-5 text-left overflow-y-auto">
            <div>
              <label class="block text-[8px] md:text-[9px] font-black uppercase text-gray-400 mb-1 ml-1">Bénéficiaire</label>
              <input v-model="newDossier.client" class="w-full bg-gray-50 border-2 border-black rounded-xl p-3 md:p-4 font-bold outline-none focus:bg-white text-sm md:text-base" placeholder="Nom de la société">
            </div>
            <div>
              <label class="block text-[8px] md:text-[9px] font-black uppercase text-gray-400 mb-1 ml-1">Installateur (Requis)</label>
              <input v-model="newDossier.installateur" class="w-full bg-gray-50 border-2 border-black rounded-xl p-3 md:p-4 font-bold outline-none focus:bg-white text-sm md:text-base" placeholder="Raison sociale">
            </div>
            <div>
              <label class="block text-[8px] md:text-[9px] font-black uppercase text-gray-400 mb-1 ml-1">Colonne de destination</label>
              <select v-model="newDossier.status" class="w-full bg-gray-50 border-2 border-black rounded-xl p-3 md:p-4 font-bold outline-none appearance-none cursor-pointer text-sm md:text-base">
                <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.label }}</option>
              </select>
            </div>
            <button @click="createDossier" :disabled="!newDossier.installateur" class="w-full bg-black text-[#D4AF37] py-4 md:py-5 rounded-xl font-black uppercase text-xs md:text-sm shadow-xl md:shadow-[4px_4px_0px_0px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 active:scale-95 mt-2">
              Générer le Dossier
            </button>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue';
import PipelineCard from './PipelineCard.vue';

const router = useRouter();
const allDossiers = ref([]);
const boardContainer = ref(null);
const showModal = ref(false);

// Initialisation avec le premier statut par défaut
const newDossier = ref({ client: '', installateur: '', status: 'simulation' });

const stages = [
  { id: 'simulation', label: '1. Simulation', color: '#94a3b8' },
  { id: 'draft', label: '2. Brouillon', color: '#3b82f6' },
  { id: 'to_sign', label: '3. À Signer', color: '#f59e0b' },
  { id: 'to_control', label: '4. Conformité AH', color: '#8b5cf6' },
  { id: 'validated', label: '5. Prêts au Dépôt', color: '#10b981' }
];

const dossiersByStatus = reactive({
  simulation: [], draft: [], to_sign: [], to_control: [], validated: []
});

const scrollBoard = (direction) => {
  if (!boardContainer.value) return;
  const colWidth = 360 + 32;
  boardContainer.value.scrollLeft += (direction === 'right' ? colWidth : -colWidth);
};

const fetchDossiers = async () => {
  try {
    const res = await api.get('/api/demo/dossiers');
    const data = res.data.data;
    allDossiers.value = data;
    stages.forEach(s => dossiersByStatus[s.id] = data.filter(d => d.status === s.id));
  } catch (err) { console.error(err); }
};

const moveDossier = async (dossier, direction) => {
  const currentIndex = stages.findIndex(s => s.id === dossier.status);
  const targetIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
  const targetStatus = stages[targetIndex].id;
  try {
    await api.put(`/api/demo/dossiers/${dossier._id}/status`, { status: targetStatus }); // Route corrigée selon demoRoutes.js
    fetchDossiers(); 
  } catch (err) { console.error(err); }
};

const createDossier = async () => {
  try {
    // Appel à la nouvelle route POST /dossiers que tu vas ajouter au back
    await api.post('/api/demo/dossiers', newDossier.value);
    showModal.value = false;
    newDossier.value = { client: '', installateur: '', status: 'simulation' };
    fetchDossiers();
  } catch (err) { alert("Erreur création dossier"); }
};

const goToDossier = (id) => router.push(`/dossier/${id}`);

const totalMwh = computed(() => allDossiers.value.reduce((acc, d) => acc + (parseFloat(d.simulation?.kwhCumac) || 0), 0).toLocaleString('fr-FR'));
const totalPrime = computed(() => allDossiers.value.reduce((acc, d) => acc + (parseFloat(d.simulation?.primeEstimee) || 0), 0).toLocaleString('fr-FR'));

onMounted(fetchDossiers);
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar-v::-webkit-scrollbar { width: 6px; }
.custom-scrollbar-v::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
</style>