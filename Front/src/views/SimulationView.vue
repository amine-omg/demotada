<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col relative">
    
    <TheHeader 
      :pageTitle="entreprise ? `Simulateur - ${entreprise.raisonSociale}` : 'Chargement...'" 
      :showBackButton="true" 
      @back="$router.push('/entreprises')" 
    />

    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
      <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Analyse de l'environnement client...</p>
    </div>

    <div v-else class="flex-1 flex flex-col max-w-4xl mx-auto w-full p-8 mt-4">
      
      <div class="flex items-center justify-between mb-12 relative">
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
          <div class="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
          </div>
          <h2 class="text-2xl font-black tracking-tight mb-2">Environnement du projet</h2>
          <p class="text-xs text-gray-500 mb-8 font-medium">Grâce au SIRET de <span class="font-bold text-black">{{ entreprise.raisonSociale }}</span>, nous avons pré-configuré les variables réglementaires.</p>
          
          <div class="grid grid-cols-2 gap-4 text-left mb-8">
            <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl relative overflow-hidden group">
              <div class="absolute right-2 top-2 text-[7px] bg-[#D4AF37] text-white px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Auto</div>
              <p class="text-[9px] font-black uppercase text-gray-400 mb-1">Zone Climatique</p>
              <p class="text-lg font-black">{{ entreprise.zoneClimatique || 'H1' }}</p>
            </div>
            <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl relative overflow-hidden">
              <div class="absolute right-2 top-2 text-[7px] bg-[#D4AF37] text-white px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Auto</div>
              <p class="text-[9px] font-black uppercase text-gray-400 mb-1">Secteur</p>
              <p class="text-sm font-black">{{ entreprise.secteurDeduit || 'Tertiaire' }}</p>
            </div>
          </div>
          <button @click="currentStep++" class="w-full bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform">
            Valider ce contexte
          </button>
        </div>

        <div v-if="currentStep === 2" class="animate-fade-in w-full text-center">
          <h2 class="text-2xl font-black tracking-tight mb-2">Nature de l'opération</h2>
          <p class="text-xs text-gray-500 mb-8 font-medium">Glissez un document pour automatiser la saisie, ou choisissez manuellement.</p>
          
          <div class="flex gap-6 items-stretch">
            <div class="flex-1 border-2 border-dashed border-[#D4AF37] bg-[#F5F2ED]/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F2ED] transition-colors relative overflow-hidden group" @click="simulateAIDrop">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm relative z-10">
                <span class="text-2xl">✨</span>
              </div>
              <p class="font-black text-sm mb-1 relative z-10">Extraction IA Gemini</p>
              <p class="text-[9px] text-gray-500 uppercase tracking-widest font-bold relative z-10">Glissez un Devis ou Audit ici</p>
            </div>

            <div class="flex items-center text-[9px] font-black uppercase text-gray-300 tracking-widest">OU</div>

            <div class="flex-1 border-2 border-gray-100 rounded-2xl p-6 flex flex-col text-left justify-center">
              <label class="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">Choix de la Fiche CEE</label>
              <select v-model="simulationData.ficheCee" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-black outline-none cursor-pointer mb-4">
                <option value="BAT-EN-101">BAT-EN-101 (Isolation combles)</option>
                <option value="BAT-EN-104">BAT-EN-104 (Fenêtres)</option>
                <option value="BAT-TH-116">BAT-TH-116 (Pompe à Chaleur)</option>
              </select>
              <button @click="currentStep++" class="w-full bg-gray-100 text-black py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-colors">
                Saisie Manuelle
              </button>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 3" class="animate-fade-in w-full max-w-md mx-auto text-center">
          <h2 class="text-2xl font-black tracking-tight mb-2">Paramètres de calcul</h2>
          <p class="text-xs text-gray-500 mb-8 font-medium">Ajustez les volumes pour la fiche <span class="font-bold text-black">{{ simulationData.ficheCee }}</span>.</p>
          
          <div class="space-y-6 text-left">
            <div class="space-y-1 relative">
              <label class="text-[9px] font-black uppercase text-gray-400 tracking-widest">Surface Totale (m²)</label>
              <input v-model="simulationData.surface" type="number" class="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-xl font-black focus:border-black outline-none transition-all"/>
              <div v-if="iaUsed" class="absolute right-4 top-9 text-[10px] text-[#D4AF37] font-black animate-pulse flex items-center gap-1">
                <span>✨ Lu par IA</span>
              </div>
            </div>

            <div v-if="simulationData.ficheCee === 'BAT-EN-104'" class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
               <span class="text-[10px] font-bold uppercase text-gray-600">Remplacement de simple vitrage ?</span>
               <select class="bg-white border border-gray-200 rounded p-1 text-xs font-bold outline-none"><option>Oui</option><option>Non</option></select>
            </div>
          </div>

          <button @click="calculerResultat" :disabled="!simulationData.surface" class="w-full mt-8 bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
            Lancer le calcul
          </button>
        </div>

        <div v-if="currentStep === 4" class="animate-fade-in w-full max-w-lg mx-auto text-center">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Estimation Officielle</p>
          
          <div class="py-8 bg-gradient-to-b from-[#FDFBF7] to-white border-2 border-[#D4AF37] rounded-3xl shadow-[0_10px_40px_-10px_rgba(212,175,55,0.3)] mb-8 relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl"></div>
            <h1 class="text-6xl font-black tracking-tighter text-[#1A1A1A]">
              {{ formatMontant(simulationData.primeEstimee) }}<span class="text-3xl text-[#D4AF37] ml-1">€</span>
            </h1>
            <p class="text-[10px] font-bold text-gray-400 uppercase mt-4">Volume : {{ formatMontant(simulationData.primeEstimee * 150) }} kWh Cumac</p>
          </div>

          <div class="flex gap-4">
            <button @click="currentStep = 1; iaUsed = false" class="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-colors">
              Recommencer
            </button>
            <button @click="transformerEnDossier" :disabled="isCreatingDossier" class="flex-[2] bg-black text-[#D4AF37] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
              <span v-if="isCreatingDossier" class="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>
              {{ isCreatingDossier ? 'Création...' : 'Transformer en Dossier' }}
              <svg v-if="!isCreatingDossier" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '/services/api';
import TheHeader from '../components/TheHeader.vue';

const route = useRoute();
const router = useRouter();

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
    console.error(error);
    router.push('/entreprises');
  } finally {
    isLoading.value = false;
  }
};

// Simulation "Fake" du drop d'un PDF pour l'effet waouh de la démo
const simulateAIDrop = () => {
  isLoading.value = true;
  setTimeout(() => {
    simulationData.value.ficheCee = 'BAT-EN-104';
    simulationData.value.surface = 145; // Valeur "lue" par l'IA
    iaUsed.value = true;
    currentStep.value = 3;
    isLoading.value = false;
  }, 1200); // Faux délai d'analyse
};

const calculerResultat = () => {
  // Calcul factice basé sur la surface pour la démo
  const base = simulationData.value.ficheCee === 'BAT-EN-104' ? 16 : 8.5; // € par m2
  const zoneMultiplicateur = entreprise.value.zoneClimatique === 'H1' ? 1.2 : (entreprise.value.zoneClimatique === 'H2' ? 1 : 0.8);
  
  simulationData.value.primeEstimee = Math.round(simulationData.value.surface * base * zoneMultiplicateur);
  currentStep.value = 4;
};

const formatMontant = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const transformerEnDossier = async () => {
  isCreatingDossier.value = true;
  try {
    // Appel API à créer plus tard pour sauvegarder un VRAI dossier lié à l'entreprise
    // Pour l'instant, on redirige vers le dashboard CEE général
    setTimeout(() => {
      router.push('/demo-cee');
    }, 1000);
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => fetchEntreprise());
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(15px); } 
  to { opacity: 1; transform: translateY(0); } 
}
</style>