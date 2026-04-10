<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'min-h-screen'" class="w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden relative min-w-0">
    
    <TheHeader 
      :pageTitle="entreprise ? `Simulateur - ${entreprise.raisonSociale}` : 'Chargement...'" 
      :showBackButton="true" 
      @back="$router.push('/entreprises')" 
      class="shrink-0 w-full"
    />

    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center bg-white z-[100]">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
      <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Analyse de l'environnement...</p>
    </div>

    <template v-else-if="entreprise">
      
      <div v-if="isMobile" class="flex-1 flex flex-col overflow-y-auto w-full p-4 pb-12 custom-scrollbar-hide relative min-w-0">
        
        <div class="flex items-center justify-between mb-8 px-2 relative shrink-0">
          <div class="absolute left-4 right-4 top-4 h-0.5 bg-gray-200 -z-10"></div>
          <div class="absolute left-4 top-4 h-0.5 bg-black -z-10 transition-all duration-500" :style="{ width: `${(currentStep - 1) * 33.33}%` }"></div>
          
          <div v-for="step in 4" :key="step" class="flex flex-col items-center gap-1.5 min-w-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 shrink-0 transition-all"
                 :class="currentStep >= step ? 'bg-black text-[#D4AF37] border-black' : 'bg-white text-gray-400 border-gray-200'">
              <svg v-if="currentStep > step" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3"/></svg>
              <span v-else>{{ step }}</span>
            </div>
            <span class="text-[7px] font-black uppercase tracking-tighter truncate w-12 text-center" :class="currentStep >= step ? 'text-black' : 'text-gray-400'">
              {{ ['Context', 'Opér.', 'Param.', 'Résult.'][step - 1] }}
            </span>
          </div>
        </div>

        <div class="bg-white border-2 border-black rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex-1 flex flex-col justify-center min-h-[350px] relative overflow-hidden min-w-0">
          
          <div v-if="currentStep === 1" class="animate-fade-in w-full text-center space-y-6">
            <h2 class="text-xl font-black tracking-tight uppercase italic">Contexte Projet</h2>
            <div class="grid grid-cols-2 gap-3 text-left">
              <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <p class="text-[7px] font-black uppercase text-gray-400 mb-1">Zone Climat</p>
                <p class="text-base font-black">{{ entreprise.zoneClimatique || 'H1' }}</p>
              </div>
              <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <p class="text-[7px] font-black uppercase text-gray-400 mb-1">Secteur</p>
                <p class="text-[10px] font-black truncate">{{ entreprise.secteurDeduit || 'Tertiaire' }}</p>
              </div>
            </div>
            <button @click="currentStep++" class="w-full bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">
              Valider le contexte
            </button>
          </div>

          <div v-if="currentStep === 2" class="animate-fade-in w-full space-y-5">
            <h2 class="text-xl font-black tracking-tight text-center uppercase italic mb-4">Opération</h2>
            
            <div class="flex flex-col gap-4">
              <div @click="simulateAIDrop" class="bg-[#F5F2ED] border-2 border-dashed border-[#D4AF37] rounded-2xl p-6 flex flex-col items-center justify-center active:bg-[#F5F2ED] active:scale-95 transition-all">
                <span class="text-3xl mb-2">✨</span>
                <p class="font-black text-xs uppercase">Extraction IA Gemini</p>
                <p class="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Tapez pour scanner un devis</p>
              </div>

              <div class="flex items-center justify-center gap-3">
                <div class="h-px bg-gray-200 flex-1"></div>
                <span class="text-[8px] font-black text-gray-300 uppercase tracking-widest">OU</span>
                <div class="h-px bg-gray-200 flex-1"></div>
              </div>

              <div class="space-y-3">
                <label class="text-[8px] font-black uppercase text-gray-400 tracking-widest">Fiche CEE</label>
                <select v-model="simulationData.ficheCee" class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold focus:border-black outline-none appearance-none">
                  <option value="BAT-EN-101">BAT-EN-101 (Isolation)</option>
                  <option value="BAT-EN-104">BAT-EN-104 (Fenêtres)</option>
                  <option value="BAT-TH-116">BAT-TH-116 (PAC)</option>
                </select>
                <button @click="currentStep++" class="w-full bg-gray-100 text-black py-3 rounded-xl font-black uppercase tracking-widest text-[9px] active:bg-gray-200">
                  Saisie Manuelle
                </button>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 3" class="animate-fade-in w-full space-y-6">
            <h2 class="text-xl font-black tracking-tight text-center uppercase italic mb-2">Paramètres</h2>
            <div class="space-y-4">
              <div class="space-y-1.5 relative">
                <label class="text-[8px] font-black uppercase text-gray-400 tracking-widest pl-1">Surface Totale (m²)</label>
                <input v-model="simulationData.surface" type="number" class="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-2xl font-black focus:border-black outline-none"/>
                <div v-if="iaUsed" class="absolute right-3 top-10 text-[8px] text-[#D4AF37] font-black flex items-center gap-1">✨ IA</div>
              </div>
              <button @click="calculerResultat" :disabled="!simulationData.surface" class="w-full bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50">
                Lancer le calcul
              </button>
            </div>
          </div>

          <div v-if="currentStep === 4" class="animate-fade-in w-full text-center space-y-6">
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Estimation Prime</p>
            
            <div class="py-6 bg-gradient-to-b from-[#FDFBF7] to-white border-2 border-[#D4AF37] rounded-[2rem] shadow-lg relative overflow-hidden">
              <h1 class="text-5xl font-black tracking-tighter text-[#1A1A1A]">
                {{ formatMontant(simulationData.primeEstimee) }}<span class="text-2xl text-[#D4AF37] ml-1">€</span>
              </h1>
              <p class="text-[8px] font-bold text-gray-400 uppercase mt-3">{{ formatMontant(simulationData.primeEstimee * 150) }} kWh Cumac</p>
            </div>

            <div class="flex flex-col gap-3">
              <button @click="transformerEnDossier" :disabled="isCreatingDossier" class="w-full bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 flex items-center justify-center gap-2">
                <span v-if="isCreatingDossier" class="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>
                {{ isCreatingDossier ? 'Création...' : 'Créer le Dossier' }}
              </button>
              <button @click="currentStep = 1; iaUsed = false" class="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-black uppercase tracking-widest text-[9px]">
                Recommencer
              </button>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="flex-1 flex flex-col max-w-4xl mx-auto w-full p-8 mt-4 overflow-y-auto">
        <div class="flex items-center justify-between mb-12 relative shrink-0">
          <div class="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
          <div class="absolute left-0 top-1/2 h-0.5 bg-black -z-10 -translate-y-1/2 transition-all duration-500" :style="{ width: `${(currentStep - 1) * 33.33}%` }"></div>
          
          <div v-for="step in 4" :key="step" class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 shadow-sm border-2"
                 :class="currentStep >= step ? 'bg-black text-[#D4AF37] border-black scale-110' : 'bg-white text-gray-400 border-gray-200'">
              <svg v-if="currentStep > step" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              <span v-else>{{ step }}</span>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest" :class="currentStep >= step ? 'text-black' : 'text-gray-400'">
              {{ ['Contexte', 'Opération', 'Paramètres', 'Résultat'][step - 1] }}
            </span>
          </div>
        </div>

        <div class="bg-white border-2 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 relative overflow-hidden flex-1 flex flex-col justify-center min-h-[400px]">
          <div v-if="currentStep === 1" class="animate-fade-in w-full max-w-lg mx-auto text-center">
            <div class="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mx-auto mb-6"><svg class="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg></div>
            <h2 class="text-2xl font-black mb-2 uppercase italic tracking-tighter">Environnement du projet</h2>
            <p class="text-xs text-gray-500 mb-8 font-medium">Grâce au SIRET de <span class="font-bold text-black">{{ entreprise.raisonSociale }}</span>.</p>
            <div class="grid grid-cols-2 gap-4 text-left mb-8">
              <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl relative overflow-hidden"><div class="absolute right-2 top-2 text-[7px] bg-[#D4AF37] text-white px-1.5 py-0.5 rounded uppercase font-black">Auto</div><p class="text-[9px] font-black uppercase text-gray-400 mb-1">Zone Climatique</p><p class="text-lg font-black">{{ entreprise.zoneClimatique || 'H1' }}</p></div>
              <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl relative overflow-hidden"><div class="absolute right-2 top-2 text-[7px] bg-[#D4AF37] text-white px-1.5 py-0.5 rounded uppercase font-black">Auto</div><p class="text-[9px] font-black uppercase text-gray-400 mb-1">Secteur</p><p class="text-sm font-black">{{ entreprise.secteurDeduit || 'Tertiaire' }}</p></div>
            </div>
            <button @click="currentStep++" class="w-full bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform">Valider ce contexte</button>
          </div>

          <div v-if="currentStep === 2" class="animate-fade-in w-full text-center">
            <h2 class="text-2xl font-black mb-2 uppercase italic tracking-tighter">Nature de l'opération</h2>
            <div class="flex gap-6 items-stretch">
              <div class="flex-1 border-2 border-dashed border-[#D4AF37] bg-[#F5F2ED]/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F2ED] transition-colors group" @click="simulateAIDrop"><div class="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm"><span class="text-2xl">✨</span></div><p class="font-black text-sm mb-1">Extraction IA Gemini</p><p class="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Glissez un Devis ici</p></div>
              <div class="flex items-center text-[9px] font-black uppercase text-gray-300 tracking-widest">OU</div>
              <div class="flex-1 border-2 border-gray-100 rounded-2xl p-6 flex flex-col text-left justify-center"><label class="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">Choix de la Fiche CEE</label><select v-model="simulationData.ficheCee" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-bold outline-none cursor-pointer mb-4"><option value="BAT-EN-101">BAT-EN-101 (Isolation)</option><option value="BAT-EN-104">BAT-EN-104 (Fenêtres)</option><option value="BAT-TH-116">BAT-TH-116 (PAC)</option></select><button @click="currentStep++" class="w-full bg-gray-100 text-black py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-colors">Saisie Manuelle</button></div>
            </div>
          </div>

          <div v-if="currentStep === 3" class="animate-fade-in w-full max-w-md mx-auto text-center">
            <h2 class="text-2xl font-black mb-2 uppercase italic tracking-tighter">Paramètres</h2>
            <div class="space-y-6 text-left">
              <div class="space-y-1 relative"><label class="text-[9px] font-black uppercase text-gray-400 mb-1">Surface Totale (m²)</label><input v-model="simulationData.surface" type="number" class="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-xl font-black focus:border-black outline-none"/><div v-if="iaUsed" class="absolute right-4 top-10 text-[10px] text-[#D4AF37] font-black animate-pulse flex items-center gap-1"><span>✨ Lu par IA</span></div></div>
            </div>
            <button @click="calculerResultat" :disabled="!simulationData.surface" class="w-full mt-8 bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform disabled:opacity-50">Lancer le calcul</button>
          </div>

          <div v-if="currentStep === 4" class="animate-fade-in w-full max-w-lg mx-auto text-center">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Estimation Officielle</p>
            <div class="py-8 bg-gradient-to-b from-[#FDFBF7] to-white border-2 border-[#D4AF37] rounded-3xl shadow-lg mb-8 relative overflow-hidden"><h1 class="text-6xl font-black tracking-tighter text-[#1A1A1A]">{{ formatMontant(simulationData.primeEstimee) }}<span class="text-3xl text-[#D4AF37] ml-1">€</span></h1><p class="text-[10px] font-bold text-gray-400 uppercase mt-4">Volume : {{ formatMontant(simulationData.primeEstimee * 150) }} kWh Cumac</p></div>
            <div class="flex gap-4">
              <button @click="currentStep = 1; iaUsed = false" class="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-colors">Recommencer</button>
              <button @click="transformerEnDossier" :disabled="isCreatingDossier" class="flex-[2] bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"><span v-if="isCreatingDossier" class="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>{{ isCreatingDossier ? 'Création...' : 'Transformer en Dossier' }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '/services/api';
import TheHeader from '../components/TheHeader.vue';

const route = useRoute();
const router = useRouter();

// ---- GESTION DU RESPONSIVE (Render Adaptatif) ----
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const entreprise = ref(null);
const isLoading = ref(true);
const currentStep = ref(1);
const iaUsed = ref(false);
const isCreatingDossier = ref(false);

const simulationData = ref({
  ficheCee: 'BAT-EN-101',
  surface: '',
  primeEstimee: 0
});

const fetchEntreprise = async () => {
  try {
    const res = await api.get(`/api/demo/entreprises/${route.params.id}`);
    entreprise.value = res.data.data;
  } catch (error) {
    router.push('/entreprises');
  } finally {
    isLoading.value = false;
  }
};

const simulateAIDrop = () => {
  isLoading.value = true;
  setTimeout(() => {
    simulationData.value.ficheCee = 'BAT-EN-104';
    simulationData.value.surface = 145;
    iaUsed.value = true;
    currentStep.value = 3;
    isLoading.value = false;
  }, 1200);
};

const calculerResultat = () => {
  const base = simulationData.value.ficheCee === 'BAT-EN-104' ? 16 : 8.5;
  const zoneMultiplicateur = entreprise.value.zoneClimatique === 'H1' ? 1.2 : (entreprise.value.zoneClimatique === 'H2' ? 1 : 0.8);
  simulationData.value.primeEstimee = Math.round(simulationData.value.surface * base * zoneMultiplicateur);
  currentStep.value = 4;
};

const formatMontant = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const transformerEnDossier = async () => {
  isCreatingDossier.value = true;
  setTimeout(() => {
    router.push('/demo-cee');
  }, 1000);
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchEntreprise();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(15px); } 
  to { opacity: 1; transform: translateY(0); } 
}
.custom-scrollbar-hide::-webkit-scrollbar { display: none; }
</style>