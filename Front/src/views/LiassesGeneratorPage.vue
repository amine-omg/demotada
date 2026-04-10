<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'h-screen'" class="w-full max-w-[100vw] min-w-0 bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden overflow-y-hidden relative">
    
    <TheHeader pageTitle="Studio de Liasses PNCEE" :showBackButton="false" class="shrink-0 w-full" />

    <div v-if="isMobile" class="flex-1 flex flex-col overflow-y-auto w-full min-w-0 pb-20 custom-scrollbar-hide bg-[#F8F9FA]">
      
      <div class="bg-white p-5 border-b-2 border-black flex flex-col gap-6 shrink-0 w-full shadow-sm min-w-0">
        <div class="flex flex-col gap-1 text-left min-w-0">
          <span class="text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37] truncate">Workflow Liasse</span>
          <h2 class="text-xl font-black text-[#1A1A1A] tracking-tighter truncate">Générateur Certifié</h2>
        </div>

        <div class="flex overflow-x-auto hide-scrollbar gap-3 pb-2 snap-x snap-mandatory w-full min-w-0">
          <button v-for="type in docTypes" :key="type.id" 
                  @click="selectedDocType = type.id"
                  class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all group shrink-0 w-[80vw] sm:w-[250px] snap-center"
                  :class="selectedDocType === type.id ? 'border-black bg-[#F5F2ED] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-100 bg-white'">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-2xl shrink-0">{{ type.icon }}</span>
              <div class="text-left min-w-0 pr-2">
                <p class="text-[10px] font-black uppercase tracking-widest truncate">{{ type.label }}</p>
                <p class="text-[8px] text-gray-400 font-bold uppercase truncate">{{ type.ref }}</p>
              </div>
            </div>
            <div v-if="generatedDocs.includes(type.id)" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] shrink-0">✓</div>
          </button>
        </div>

        <label class="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-[1.5rem] bg-gray-50 active:bg-gray-100 transition-all cursor-pointer relative overflow-hidden min-w-0">
          <input type="file" @change="handleUpload" class="hidden" :disabled="isAnalyzing" />
          <div v-if="!isAnalyzing" class="text-center">
            <div class="text-3xl mb-2 opacity-80">📁</div>
            <p class="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]">Glissez le Devis</p>
          </div>
          <div v-else class="text-center z-10 w-full px-4 min-w-0">
            <div class="w-8 h-8 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-2 mx-auto shrink-0"></div>
            <p class="text-[8px] font-black uppercase tracking-widest animate-pulse truncate w-full text-center">Mapping Gemini...</p>
          </div>
          <div v-if="isAnalyzing" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,1)] top-0 animate-[scan_2s_infinite]"></div>
        </label>
      </div>

      <div class="bg-[#F5F2ED] p-5 w-full shrink-0 min-w-0">
        <template v-if="extractedData">
          <div class="flex flex-col gap-1 mb-5 text-left min-w-0">
            <span class="text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37] truncate">Édition Intelligente</span>
            <h2 class="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] truncate">Données pour {{ selectedDocType }}</h2>
          </div>

          <div class="bg-white border-2 border-black rounded-[1.5rem] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-5 w-full min-w-0">
            <div class="space-y-3 text-left w-full min-w-0">
              <div class="space-y-1 min-w-0">
                <label class="text-[8px] font-black uppercase text-gray-400 block truncate">Nom du site</label>
                <input v-model="formData.nom_site" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none focus:border-black"/>
              </div>
              <div class="flex gap-3 w-full min-w-0">
                <div class="flex-1 space-y-1 min-w-0">
                  <label class="text-[8px] font-black uppercase text-gray-400 block truncate">Surface (m²)</label>
                  <input v-model="formData.surface" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none"/>
                </div>
                <div class="flex-1 space-y-1 min-w-0">
                  <label class="text-[8px] font-black uppercase text-gray-400 block truncate">Zone Climat</label>
                  <input v-model="formData.zone" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none"/>
                </div>
              </div>
            </div>

            <div v-if="selectedDocType === 'BS'" class="space-y-3 pt-4 border-t border-gray-100 text-left min-w-0">
              <p class="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest truncate">Options Cadre</p>
              <div class="space-y-1 min-w-0">
                <label class="text-[8px] font-black uppercase text-gray-400 block truncate">Date de signature</label>
                <input type="date" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none"/>
              </div>
            </div>

            <div v-if="selectedDocType === 'R2'" class="space-y-3 pt-4 border-t border-gray-100 text-left min-w-0">
              <p class="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest truncate">Tableau de Dist.</p>
              <div class="space-y-1 min-w-0">
                <label class="text-[8px] font-black uppercase text-gray-400 block truncate">Nombre de lignes</label>
                <input value="18 lignes détectées" readonly class="w-full bg-[#F5F2ED] border border-black/5 rounded-xl p-3 text-[10px] font-black outline-none"/>
              </div>
            </div>

            <button @click="generateCurrent" :disabled="isGenerating"
                    class="w-full py-4 bg-black text-[#D4AF37] rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(212,175,55,0.3)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <span v-if="isGenerating" class="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin shrink-0"></span>
              <span class="truncate">{{ isGenerating ? 'Génération...' : 'Sceller le document' }}</span>
            </button>
          </div>
        </template>
        
        <div v-else class="h-48 flex flex-col items-center justify-center text-gray-300 w-full min-w-0">
           <p class="text-5xl mb-4 opacity-20">⚡</p>
           <p class="text-[9px] font-black uppercase tracking-widest text-center px-4 w-full">Prêt pour l'extraction Gemini</p>
        </div>
      </div>

      <div class="bg-white p-5 border-t-2 border-black flex flex-col shrink-0 w-full min-w-0">
        <h2 class="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-50 pb-3 flex items-center gap-2 truncate">
           <svg class="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
           Liasse PNCEE Garantie
        </h2>

        <div class="space-y-3 w-full min-w-0">
          <div v-for="type in docTypes" :key="type.id" 
               class="p-3 rounded-xl border-2 flex items-center justify-between transition-all min-w-0"
               :class="generatedDocs.includes(type.id) ? 'border-green-100 bg-green-50/30' : 'border-gray-50 bg-gray-50/30 opacity-50'">
            <div class="flex items-center gap-2 min-w-0">
               <span class="text-base shrink-0">{{ generatedDocs.includes(type.id) ? '📄' : '⏳' }}</span>
               <p class="text-[9px] font-black uppercase tracking-widest text-gray-600 truncate">{{ type.label }}</p>
            </div>
            <button v-if="generatedDocs.includes(type.id)" class="p-1.5 hover:bg-white rounded-lg transition-colors shrink-0">
               <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </button>
          </div>
        </div>

        <button v-if="generatedDocs.length > 0" class="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] mt-6 flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform">
           <span class="truncate">Exporter l'archive</span>
           <svg class="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

    </div>

    <div v-else class="flex-1 flex overflow-hidden w-full min-w-0">
      
      <div class="w-[30%] bg-white border-r border-gray-200 p-8 flex flex-col gap-8 shrink-0">
        <div class="flex flex-col gap-1">
          <span class="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Workflow Liasse</span>
          <h2 class="text-xl font-black text-[#1A1A1A] tracking-tighter">Générateur Certifié</h2>
        </div>

        <div class="flex flex-col gap-3">
          <button v-for="type in docTypes" :key="type.id" 
                  @click="selectedDocType = type.id"
                  class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all group"
                  :class="selectedDocType === type.id ? 'border-black bg-[#F5F2ED] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-100 bg-white hover:border-black'">
            <div class="flex items-center gap-4">
              <span class="text-xl group-hover:scale-110 transition-transform">{{ type.icon }}</span>
              <div class="text-left">
                <p class="text-[11px] font-black uppercase tracking-widest">{{ type.label }}</p>
                <p class="text-[9px] text-gray-400 font-bold uppercase">{{ type.ref }}</p>
              </div>
            </div>
            <div v-if="generatedDocs.includes(type.id)" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
          </button>
        </div>

        <label class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 hover:bg-gray-100 hover:border-[#D4AF37] transition-all cursor-pointer group relative overflow-hidden">
          <input type="file" @change="handleUpload" class="hidden" :disabled="isAnalyzing" />
          <div v-if="!isAnalyzing" class="text-center p-6">
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Glissez le Devis</p>
            <p class="text-[8px] text-gray-400 font-bold uppercase mt-2">Extraction multi-documents</p>
          </div>
          <div v-else class="text-center z-10">
            <div class="w-12 h-12 border-2 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4 mx-auto"></div>
            <p class="text-[9px] font-black uppercase tracking-widest animate-pulse">Mapping Gemini...</p>
          </div>
          <div v-if="isAnalyzing" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,1)] top-0 animate-[scan_2s_infinite]"></div>
        </label>
      </div>

      <div class="w-[40%] bg-[#F5F2ED] p-10 overflow-y-auto custom-scrollbar-hide shrink-0 relative">
        <template v-if="extractedData">
          <div class="flex flex-col gap-1 mb-8">
            <span class="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Édition Intelligente</span>
            <h2 class="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">Données Extraites pour {{ selectedDocType }}</h2>
          </div>

          <div class="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div class="space-y-4 text-left">
              <div class="space-y-1">
                <label class="text-[8px] font-black uppercase text-gray-400">Nom du site</label>
                <input v-model="formData.nom_site" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none focus:border-black"/>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[8px] font-black uppercase text-gray-400">Surface (m²)</label>
                  <input v-model="formData.surface" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none"/>
                </div>
                <div class="space-y-1">
                  <label class="text-[8px] font-black uppercase text-gray-400">Zone Climatique</label>
                  <input v-model="formData.zone" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none"/>
                </div>
              </div>
            </div>

            <div v-if="selectedDocType === 'BS'" class="space-y-4 pt-4 border-t border-gray-100 text-left">
              <p class="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Options du Cadre de Contribution</p>
              <div class="space-y-1">
                <label class="text-[8px] font-black uppercase text-gray-400">Date de signature du cadre</label>
                <input type="date" class="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs font-black outline-none"/>
              </div>
            </div>

            <div v-if="selectedDocType === 'R2'" class="space-y-4 pt-4 border-t border-gray-100 text-left">
              <p class="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Tableau de Distribution</p>
              <div class="space-y-1">
                <label class="text-[8px] font-black uppercase text-gray-400">Nombre de lignes extraites</label>
                <input value="18 lignes détectées" readonly class="w-full bg-[#F5F2ED] border border-black/5 rounded-xl p-3 text-[10px] font-black outline-none"/>
              </div>
            </div>

            <button @click="generateCurrent" :disabled="isGenerating"
                    class="w-full py-5 bg-black text-[#D4AF37] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
              <span v-if="isGenerating" class="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>
              {{ isGenerating ? 'Génération...' : 'Sceller le document' }}
            </button>
          </div>
        </template>
        
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-300">
           <p class="text-6xl mb-6 opacity-20">⚡</p>
           <p class="text-[10px] font-black uppercase tracking-widest">Prêt pour l'extraction Gemini</p>
        </div>
      </div>

      <div class="w-[30%] bg-white p-10 flex flex-col border-l border-gray-200 shrink-0">
        <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 border-b border-gray-50 pb-4 flex items-center gap-2">
           <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
           Liasse PNCEE Garantie
        </h2>

        <div class="flex-1 space-y-4">
          <div v-for="type in docTypes" :key="type.id" 
               class="p-4 rounded-2xl border-2 flex items-center justify-between transition-all"
               :class="generatedDocs.includes(type.id) ? 'border-green-100 bg-green-50/30' : 'border-gray-50 bg-gray-50/30 opacity-50'">
            <div class="flex items-center gap-3">
               <span class="text-lg">{{ generatedDocs.includes(type.id) ? '📄' : '⏳' }}</span>
               <p class="text-[10px] font-black uppercase tracking-widest text-gray-600">{{ type.label }}</p>
            </div>
            <button v-if="generatedDocs.includes(type.id)" class="p-2 hover:bg-white rounded-lg transition-colors">
               <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </button>
          </div>
        </div>

        <button v-if="generatedDocs.length > 0" class="w-full py-5 bg-[#1A1A1A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mt-8 flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-transform">
           Exporter l'archive PNCEE
           <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import TheHeader from '../components/TheHeader.vue';

// ---- GESTION DU RESPONSIVE (Render Adaptatif) ----
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // 768px = point de bascule standard
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// ---- ETATS ----
const isAnalyzing = ref(false);
const isGenerating = ref(false);
const extractedData = ref(null);
const selectedDocType = ref('AH');
const generatedDocs = ref([]);

const docTypes = [
  { id: 'AH', label: 'Attestation Honneur', ref: 'AH BAT-EN-101', icon: '📝' },
  { id: 'BS', label: 'Cadre Contribution', ref: 'Bons de Souscription', icon: '🤝' },
  { id: 'R2', label: 'Tableau Distrib.', ref: 'Annexe R2 / QDP', icon: '📊' }
];

const formData = ref({
  nom_site: '',
  surface: '2000',
  zone: 'H1'
});

const handleUpload = () => {
  isAnalyzing.value = true;
  setTimeout(() => {
    isAnalyzing.value = false;
    extractedData.value = true;
    formData.value.nom_site = "AGENCE A2BCD";
  }, 2500);
};

const generateCurrent = () => {
  isGenerating.value = true;
  setTimeout(() => {
    isGenerating.value = false;
    if (!generatedDocs.value.includes(selectedDocType.value)) {
      generatedDocs.value.push(selectedDocType.value);
    }
  }, 1500);
};
</script>

<style scoped>
.custom-scrollbar-hide::-webkit-scrollbar { display: none; }
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Scroll horizontal propre sur mobile pour le menu des docs */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>