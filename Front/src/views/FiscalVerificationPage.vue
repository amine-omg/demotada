<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'h-screen'" class="w-full max-w-[100vw] min-w-0 bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden overflow-y-hidden relative">
    
    <TheHeader pageTitle="Audit de Précarité Fiscale" :showBackButton="false" class="shrink-0 w-full" />

    <div v-if="isMobile" class="flex-1 flex flex-col overflow-y-auto w-full min-w-0 pb-20 custom-scrollbar-hide bg-[#F8F9FA]">
      
      <div class="bg-white p-5 border-b-2 border-black flex flex-col gap-5 shrink-0 w-full shadow-sm min-w-0">
        <div class="flex flex-col gap-1 text-left min-w-0">
          <span class="text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37] truncate">Conformité Fiscale</span>
          <h2 class="text-xl font-black text-[#1A1A1A] tracking-tighter truncate">Scanner d'Imposition</h2>
        </div>

        <label class="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-[1.5rem] bg-gray-50 active:bg-gray-100 transition-all cursor-pointer relative overflow-hidden min-w-0">
          <input type="file" @change="handleTaxUpload" class="hidden" :disabled="isAnalyzing" />
          
          <div v-if="!isAnalyzing" class="text-center p-4">
            <div class="text-4xl mb-2 opacity-80">📄</div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Déposez l'Avis</p>
            <p class="text-[8px] text-gray-400 font-bold uppercase mt-1">Vérification RFR auto</p>
          </div>

          <div v-else class="text-center z-10 w-full px-4">
            <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-3 mx-auto shrink-0"></div>
            <p class="text-[8px] font-black uppercase tracking-widest animate-pulse truncate">Lecture OCR Gemini...</p>
          </div>
          
          <div v-if="isAnalyzing" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,1)] top-0 animate-[scan_2s_infinite]"></div>
        </label>

        <div class="p-3 bg-[#F5F2ED] rounded-xl border border-black/5 min-w-0">
           <p class="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest mb-1 truncate">Note Sécurité</p>
           <p class="text-[9px] font-bold text-gray-500 uppercase leading-relaxed text-left">Vérification via l'administration fiscale sans stockage des pièces sensibles.</p>
        </div>
      </div>

      <div class="bg-[#F5F2ED] p-5 w-full shrink-0 min-w-0">
        <template v-if="fiscalData">
          <div class="flex flex-col gap-1 mb-5 text-left min-w-0">
            <span class="text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37] truncate">Résultats de l'Audit</span>
            <h2 class="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] truncate">Éligibilité Coup de Pouce</h2>
          </div>

          <div class="bg-white border-2 border-black rounded-[1.5rem] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6 w-full min-w-0 animate-fade-in">
            
            <div class="flex gap-4 text-left w-full min-w-0">
              <div class="flex-1 space-y-1 min-w-0">
                <label class="text-[7px] font-black uppercase text-gray-400 tracking-widest truncate block">RFR</label>
                <div class="text-xl font-black text-[#1A1A1A] tabular-nums truncate">{{ fiscalData.rfr.toLocaleString() }} €</div>
              </div>
              <div class="flex-1 space-y-1 min-w-0">
                <label class="text-[7px] font-black uppercase text-gray-400 tracking-widest truncate block">Personnes foyer</label>
                <div class="text-xl font-black text-[#1A1A1A] tabular-nums truncate">{{ fiscalData.household }}</div>
              </div>
            </div>

            <div class="pt-5 border-t border-gray-100 text-left min-w-0">
              <label class="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-3 block truncate">Classement Énergétique</label>
              <div class="p-4 rounded-xl border-2 border-black flex items-center justify-between"
                   :class="getPrecariousnessStyle(fiscalData.level).bg">
                <div class="flex flex-col min-w-0 pr-2">
                  <span class="text-[10px] font-black uppercase tracking-widest mb-1 truncate" :class="getPrecariousnessStyle(fiscalData.level).text">
                    {{ getPrecariousnessStyle(fiscalData.level).label }}
                  </span>
                  <span class="text-[7px] font-bold uppercase opacity-60 truncate">Barème 2026 Conforme</span>
                </div>
                <div class="text-2xl shrink-0">{{ getPrecariousnessStyle(fiscalData.level).icon }}</div>
              </div>
            </div>

            <div class="p-3 bg-gray-50 rounded-xl border border-black/5 flex items-center justify-between text-left min-w-0">
               <div class="min-w-0 pr-2">
                  <p class="text-[8px] font-black text-gray-400 uppercase truncate">Justificatif de précarité</p>
                  <p class="text-[9px] font-bold text-black uppercase mt-1 truncate">Généré par les impôts</p>
               </div>
               <svg class="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
        </template>
        
        <div v-else class="h-48 flex flex-col items-center justify-center text-gray-300 w-full min-w-0">
           <p class="text-5xl mb-4 opacity-20">⚖️</p>
           <p class="text-[9px] font-black uppercase tracking-widest leading-relaxed text-center px-4 w-full">En attente d'un avis d'imposition</p>
        </div>
      </div>

      <div class="bg-white p-5 border-t-2 border-black flex flex-col shrink-0 w-full min-w-0">
        <h2 class="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-50 pb-3 flex items-center gap-2 truncate">
           <svg class="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
           Statut Compliance
        </h2>

        <div class="space-y-4 w-full text-left min-w-0">
           <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 min-w-0">
              <span class="text-[8px] font-black uppercase tracking-widest text-gray-500 truncate pr-2">Authenticité Avis</span>
              <span class="text-[9px] font-black text-green-600 shrink-0">✓ CERTIFIÉ</span>
           </div>
           <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 min-w-0">
              <span class="text-[8px] font-black uppercase tracking-widest text-gray-500 truncate pr-2">API Impôts Direct</span>
              <span class="text-[9px] font-black text-green-600 shrink-0">✓ RÉP 200</span>
           </div>
           
           <div class="mt-6 p-5 bg-[#F5F2ED] rounded-[1.5rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-0">
              <p class="text-[8px] font-black uppercase text-[#D4AF37] mb-2 tracking-[0.2em] truncate">Décision Dossier</p>
              <p class="text-[10px] font-bold text-black leading-relaxed">
                 "Le foyer est classé en <span class="text-[#D4AF37] font-black">Grande Précarité</span>. Le montant est doublé selon l'arrêté."
              </p>
           </div>
        </div>

        <button v-if="fiscalData" @click="confirmFiscal" class="w-full py-4 bg-black text-[#D4AF37] rounded-xl font-black text-[9px] uppercase tracking-[0.3em] mt-6 flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform">
           <span class="truncate">Valider le Statut</span>
           <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
        </button>
      </div>

    </div>

    <div v-else class="flex-1 flex overflow-hidden w-full min-w-0">
      
      <div class="w-[30%] bg-white border-r border-gray-200 p-8 flex flex-col gap-8 shrink-0">
        <div class="flex flex-col gap-1">
          <span class="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Conformité Fiscale</span>
          <h2 class="text-xl font-black text-[#1A1A1A] tracking-tighter text-left">Scanner d'Imposition</h2>
        </div>

        <label class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 hover:bg-gray-100 hover:border-[#D4AF37] transition-all cursor-pointer group relative overflow-hidden">
          <input type="file" @change="handleTaxUpload" class="hidden" :disabled="isAnalyzing" />
          
          <div v-if="!isAnalyzing" class="text-center p-6">
            <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">📄</div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Déposez l'Avis d'Imposition</p>
            <p class="text-[8px] text-gray-400 font-bold uppercase mt-2">Vérification RFR automatique</p>
          </div>

          <div v-else class="text-center z-10">
            <div class="w-12 h-12 border-2 border-gray-100 border-t-[#D4AF37] rounded-full animate-spin mb-4 mx-auto"></div>
            <p class="text-[9px] font-black uppercase tracking-widest animate-pulse">Lecture OCR Gemini...</p>
          </div>
          
          <div v-if="isAnalyzing" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,1)] top-0 animate-[scan_2s_infinite]"></div>
        </label>

        <div class="p-4 bg-[#F5F2ED] rounded-2xl border border-black/5">
           <p class="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Note Sécurité</p>
           <p class="text-[9px] font-bold text-gray-500 uppercase leading-relaxed text-left">Les données sont vérifiées via le service de l'administration fiscale sans stockage des pièces sensibles.</p>
        </div>
      </div>

      <div class="w-[40%] bg-[#F5F2ED] p-10 overflow-y-auto custom-scrollbar-hide relative shrink-0">
        <template v-if="fiscalData">
          <div class="flex flex-col gap-1 mb-8 text-left">
            <span class="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Résultats de l'Audit</span>
            <h2 class="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">Éligibilité Coup de Pouce</h2>
          </div>

          <div class="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8 animate-fade-in w-full min-w-0">
            
            <div class="grid grid-cols-2 gap-6 text-left">
              <div class="space-y-1">
                <label class="text-[8px] font-black uppercase text-gray-400 tracking-widest">Revenu Fiscal (RFR)</label>
                <div class="text-2xl font-black text-[#1A1A1A] tabular-nums">{{ fiscalData.rfr.toLocaleString() }} €</div>
              </div>
              <div class="space-y-1">
                <label class="text-[8px] font-black uppercase text-gray-400 tracking-widest">Personnes au foyer</label>
                <div class="text-2xl font-black text-[#1A1A1A] tabular-nums">{{ fiscalData.household }}</div>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100 text-left">
              <label class="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-4 block">Classement Énergétique</label>
              <div class="p-6 rounded-2xl border-2 border-black flex items-center justify-between"
                   :class="getPrecariousnessStyle(fiscalData.level).bg">
                <div class="flex flex-col">
                  <span class="text-[10px] font-black uppercase tracking-widest mb-1" :class="getPrecariousnessStyle(fiscalData.level).text">
                    {{ getPrecariousnessStyle(fiscalData.level).label }}
                  </span>
                  <span class="text-[8px] font-bold uppercase opacity-60">Barème 2026 Conforme</span>
                </div>
                <div class="text-2xl">{{ getPrecariousnessStyle(fiscalData.level).icon }}</div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-xl border border-black/5 flex items-center justify-between text-left">
               <div>
                  <p class="text-[8px] font-black text-gray-400 uppercase">Justificatif de précarité</p>
                  <p class="text-[10px] font-bold text-black uppercase mt-1">Généré par le service des impôts</p>
               </div>
               <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
        </template>
        
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-300 w-full min-w-0">
           <p class="text-6xl mb-6 opacity-20">⚖️</p>
           <p class="text-[10px] font-black uppercase tracking-widest leading-relaxed text-center px-4 w-full">En attente d'un avis d'imposition<br>pour le calcul des primes.</p>
        </div>
      </div>

      <div class="w-[30%] bg-white p-10 flex flex-col border-l border-gray-200 shrink-0">
        <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 border-b border-gray-50 pb-4 flex items-center gap-2 shrink-0">
           <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
           Statut Compliance
        </h2>

        <div class="space-y-6 flex-1 text-left">
           <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span class="text-[9px] font-black uppercase tracking-widest text-gray-500">Authenticité Avis</span>
              <span class="text-[10px] font-black text-green-600">✓ CERTIFIÉ</span>
           </div>
           <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span class="text-[9px] font-black uppercase tracking-widest text-gray-500">API Impôts Direct</span>
              <span class="text-[10px] font-black text-green-600">✓ RÉPONSE 200</span>
           </div>
           
           <div class="mt-8 p-6 bg-[#F5F2ED] rounded-[2rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p class="text-[8px] font-black uppercase text-[#D4AF37] mb-3 tracking-[0.2em]">Décision Dossier</p>
              <p class="text-[11px] font-bold text-black leading-relaxed">
                 "Le foyer est classé en <span class="text-[#D4AF37] font-black">Grande Précarité</span>. Le montant de la prime CEE est doublé selon l'arrêté en vigueur."
              </p>
           </div>
        </div>

        <button v-if="fiscalData" @click="confirmFiscal" class="w-full py-5 bg-black text-[#D4AF37] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mt-8 flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02]">
           Valider le Statut Fiscale
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
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

const isAnalyzing = ref(false);
const fiscalData = ref(null);

const handleTaxUpload = () => {
  isAnalyzing.value = true;
  setTimeout(() => {
    isAnalyzing.value = false;
    fiscalData.value = {
      rfr: 19450,
      household: 3,
      level: 'very_precarious'
    };
  }, 3000);
};

const getPrecariousnessStyle = (lvl) => {
  const map = {
    very_precarious: { label: 'Grande Précarité', bg: 'bg-[#F5F2ED] border-[#D4AF37]', text: 'text-[#D4AF37]', icon: '🏆' },
    precarious: { label: 'Précarité', bg: 'bg-white border-black', text: 'text-black', icon: '🥈' },
    standard: { label: 'Classique', bg: 'bg-gray-50 border-gray-200', text: 'text-gray-400', icon: '🥉' }
  };
  return map[lvl];
};

const confirmFiscal = () => {
  alert("Statut fiscal scellé avec succès.");
};
</script>

<style scoped>
.custom-scrollbar-hide::-webkit-scrollbar { display: none; }
.animate-fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>