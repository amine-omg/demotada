<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col">
    <TheHeader pageTitle="Generateur Demo" :showBackButton="false" />

    <div class="flex-1 flex p-6 md:p-10 gap-8 h-[calc(100vh-6rem)] overflow-hidden">
      
      <div class="w-1/2 flex flex-col bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
        
        <label 
          v-if="!pdfPreviewUrl"
          class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 m-8 rounded-[2rem] bg-gray-50 hover:bg-gray-100 hover:border-[#D4AF37] transition-all cursor-pointer group"
        >
          <input type="file" @change="uploadDocument" accept=".pdf,.jpg,.png" class="hidden" />
          <div class="text-7xl mb-6 transition-transform group-hover:scale-110 opacity-80">📄</div>
          <h2 class="text-xl font-black uppercase tracking-widest text-[#1A1A1A] mb-2">Glissez le devis client</h2>
          <p class="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">Le moteur d'Audit CEE va tout pré-remplir</p>
        </label>

        <div v-else class="flex-1 flex flex-col relative bg-gray-100">
          <div class="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-white to-transparent z-20">
            <span class="text-xs font-black uppercase tracking-widest text-[#1A1A1A] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">Document Source</span>
            <button @click="resetDemo" class="text-xs font-bold text-gray-500 hover:text-[#1A1A1A] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 transition-colors">Nouveau fichier</button>
          </div>
          
          <iframe :src="pdfPreviewUrl" class="w-full h-full border-none z-10" title="Aperçu du document"></iframe>
          
          <div v-if="isAnalyzing" class="absolute inset-0 z-30 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center">
            <div class="w-20 h-20 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-6 shadow-lg"></div>
            <p class="text-sm font-black tracking-[0.3em] text-[#1A1A1A] uppercase animate-pulse">Moteur IA en cours (Gemini 3)</p>
            <p class="text-[10px] text-[#D4AF37] uppercase tracking-widest mt-2 font-bold">Extraction des données & calcul CEE</p>
          </div>
          <div v-if="isAnalyzing" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.8)] top-0 animate-[scan_2.5s_ease-in-out_infinite] z-40"></div>
        </div>
      </div>

      <div class="w-1/2 flex flex-col bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 overflow-y-auto custom-scrollbar relative">
        
        <div v-if="!extractedData && !isAnalyzing" class="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-40">
          <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <p class="text-sm font-black uppercase tracking-widest text-gray-400">En attente d'un document</p>
        </div>

        <template v-if="extractedData">
          <div class="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <h2 class="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A]">Dossier <span class="text-[#D4AF37]">Pré-rempli</span></h2>
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">Automatisation IA Karnain V3</p>
            </div>
            
            <div class="px-4 py-2 rounded-xl flex items-center gap-2 border font-black text-xs uppercase tracking-widest shadow-sm"
                 :class="hasAnomalies ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'">
              <span class="text-base">{{ hasAnomalies ? '⚠️' : '✅' }}</span>
              {{ hasAnomalies ? 'Anomalies détectées' : 'Dossier Conforme' }}
            </div>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm">
            <h3 class="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Calculateur Automatique CEE
            </h3>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                <span class="block text-[8px] text-gray-400 uppercase tracking-widest mb-1">Code Postal</span>
                <span class="font-black text-[#1A1A1A]">{{ extractedData.analyse_geographique?.code_postal || 'N/A' }}</span>
              </div>
              <div class="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                <span class="block text-[8px] text-gray-400 uppercase tracking-widest mb-1">Département</span>
                <span class="font-black text-[#1A1A1A]">{{ extractedData.analyse_geographique?.departement || 'N/A' }}</span>
              </div>
              <div class="bg-white rounded-xl p-3 border border-[#D4AF37]/30 shadow-sm">
                <span class="block text-[8px] text-[#D4AF37] uppercase tracking-widest mb-1">Zone Climatique</span>
                <span class="font-black text-[#1A1A1A]">{{ extractedData.analyse_geographique?.zone_climatique || 'N/A' }}</span>
              </div>
              <div class="bg-white rounded-xl p-3 border border-[#D4AF37]/30 shadow-sm col-span-2 md:col-span-1">
                <span class="block text-[8px] text-[#D4AF37] uppercase tracking-widest mb-1">Fiche Visée</span>
                <span class="font-black text-[#1A1A1A]">{{ extractedData.fiche_cee || 'N/A' }}</span>
              </div>
            </div>

            <div class="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 flex justify-between items-center mb-4 shadow-md">
              <div class="flex flex-col">
                <span class="text-[10px] text-[#D4AF37] uppercase tracking-widest font-black mb-1">Simulation Prime</span>
                <span class="text-sm text-white font-mono font-bold">{{ extractedData.simulation_kwh_cumac }}</span>
              </div>
            </div>

            <div class="flex flex-col gap-3 pt-4 border-t border-gray-200">
               <div class="flex flex-wrap gap-2">
                 <span v-for="(val, key) in extractedData.criteres_techniques" :key="key" class="bg-white text-gray-600 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                   <span class="text-[#1A1A1A]">{{ key }} :</span> {{ val }}
                 </span>
               </div>
               <p class="text-sm font-bold" :class="extractedData.decision_ia?.toLowerCase().includes('attention') ? 'text-amber-600' : 'text-green-600'">
                 👉 {{ extractedData.decision_ia }}
               </p>
            </div>
          </div>

          <div class="space-y-5">
            
            <div class="flex gap-4">
              <div class="flex-1 space-y-2 relative">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                  Installateur
                  <span class="text-[#D4AF37]">IA</span>
                </label>
                <input v-model="formData.entreprise" class="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold transition-all outline-none shadow-inner"/>
              </div>

              <div class="w-1/3 space-y-2 relative">
                <label class="text-[10px] font-black uppercase tracking-widest flex justify-between" :class="isSiretMissing ? 'text-red-500' : 'text-gray-500'">
                  SIRET
                  <span v-if="isSiretMissing" class="text-red-500 animate-pulse">MANQUANT</span>
                  <span v-else class="text-[#D4AF37]">IA</span>
                </label>
                <input v-model="formData.siret" 
                       class="w-full bg-gray-50 border focus:bg-white rounded-xl p-4 font-bold transition-all outline-none shadow-inner"
                       :class="isSiretMissing ? 'border-red-300 bg-red-50 text-red-900 ring-1 ring-red-400' : 'border-gray-200 text-[#1A1A1A] focus:border-[#D4AF37]'"/>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                Nature des travaux
                <span class="text-[#D4AF37]">IA</span>
              </label>
              <input v-model="formData.type_travaux" class="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold transition-all outline-none shadow-inner"/>
            </div>

            <div class="flex gap-4">
              <div class="flex-1 space-y-2">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                  Quantité / Surface
                  <span class="text-[#D4AF37]">IA</span>
                </label>
                <input v-model="formData.surface_quantite" class="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold transition-all outline-none shadow-inner"/>
              </div>
              
              <div class="flex-1 space-y-2">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                  Montant TTC
                  <span class="text-[#D4AF37]">IA</span>
                </label>
                <input v-model="formData.montant_ttc" class="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold transition-all outline-none shadow-inner"/>
              </div>
            </div>

          </div>

          <div class="mt-8 pt-6 border-t border-gray-200 flex gap-4">
            <button @click="resetDemo" class="px-6 py-4 rounded-xl border border-gray-300 text-gray-600 font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-xs">
              Annuler
            </button>
            <button 
              class="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-3 text-white"
              :class="hasAnomalies ? 'bg-amber-600 hover:bg-amber-700 shadow-[0_10px_20px_rgba(217,119,6,0.2)]' : 'bg-[#1A1A1A] hover:bg-black shadow-[0_10px_20px_rgba(0,0,0,0.2)]'"
            >
              {{ hasAnomalies ? 'Forcer la création (Anomalies)' : 'Valider & Créer le dossier' }}
              <svg class="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>

        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue';

const isAnalyzing = ref(false);
const extractedData = ref(null);
const pdfPreviewUrl = ref(null);

const formData = ref({
  entreprise: '',
  siret: '',
  type_travaux: '',
  surface_quantite: '',
  montant_ttc: ''
});

const isSiretMissing = computed(() => {
  if (!formData.value.siret) return true;
  const s = formData.value.siret.toLowerCase();
  return s.includes('non') || s.includes('n/a') || s.includes('absent');
});

const hasAnomalies = computed(() => {
  if (!extractedData.value) return false;
  const decisionWarning = extractedData.value.decision_ia?.toLowerCase().includes('attention');
  return isSiretMissing.value || decisionWarning;
});

const uploadDocument = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  pdfPreviewUrl.value = URL.createObjectURL(file);

  isAnalyzing.value = true;
  extractedData.value = null;

  const fd = new FormData();
  fd.append('file', file); // Correction ici (fd au lieu de formData)

  try {
    const response = await api.post('/api/demo/analyze-quote', fd);
    
    setTimeout(() => {
      const data = response.data.data;
      extractedData.value = data;
      
      formData.value = {
        entreprise: data.entreprise || '',
        siret: data.siret || '',
        type_travaux: data.type_travaux || '',
        surface_quantite: data.surface_quantite || '',
        montant_ttc: data.montant_ttc || ''
      };
      
      isAnalyzing.value = false;
    }, 2000);

  } catch (error) {
    console.error("Erreur d'analyse:", error);
    isAnalyzing.value = false;
    alert("Impossible d'analyser le document pour la démo.");
    pdfPreviewUrl.value = null;
  }
};

const resetDemo = () => {
  extractedData.value = null;
  pdfPreviewUrl.value = null;
  formData.value = { entreprise: '', siret: '', type_travaux: '', surface_quantite: '', montant_ttc: '' };
};
</script>

<style scoped>
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.animate-scan {
  animation: scan 2.5s infinite ease-in-out;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.5); /* Hover doré */
}
</style>