<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'h-screen'" class="w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden overflow-y-hidden relative min-w-0">
    
    <TheHeader pageTitle="Portail Obligé" :showBackButton="false" class="shrink-0 w-full z-40" />

    <div v-if="isMobile" class="flex-1 flex flex-col overflow-y-auto w-full p-4 pb-24 custom-scrollbar-hide bg-[#F8F9FA] min-w-0">
      
      <div class="flex flex-col gap-5 mb-8 shrink-0 min-w-0">
        <div class="min-w-0">
          <h1 class="text-2xl font-black text-[#1A1A1A] tracking-tighter truncate">Audit des Stocks</h1>
          <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
             <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
             <span class="truncate">Accès Partenaire : Direction Conformité</span>
          </p>
        </div>
        
        <div class="grid grid-cols-2 gap-3 w-full min-w-0">
           <div class="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left min-w-0 overflow-hidden">
              <p class="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-1 truncate">Volume Cumulé</p>
              <p class="text-lg font-black text-black tabular-nums truncate">1.42 <span class="text-[10px] text-[#D4AF37]">GWh</span></p>
           </div>
           <div class="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left min-w-0 overflow-hidden">
              <p class="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-1 truncate">Dossiers</p>
              <p class="text-lg font-black text-black tabular-nums truncate">128</p>
           </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 min-w-0">
        <div class="flex flex-col gap-4 min-w-0">
           <div class="text-left min-w-0">
              <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] truncate">Flux en temps réel</h2>
              <p class="text-[8px] text-gray-400 font-bold uppercase mt-1 truncate">Transparence totale de constitution</p>
           </div>
           <button class="w-full py-4 bg-black text-[#D4AF37] rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shrink-0">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span class="truncate">Télécharger Archive PNCEE (ZIP)</span>
           </button>
        </div>

        <div class="flex flex-col gap-4 min-w-0">
          <div v-for="lot in dummyLots" :key="lot.id" 
               class="bg-white border-2 border-black rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(212,175,55,0.1)] overflow-hidden flex flex-col min-w-0">
            
            <div class="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/30 min-w-0">
              <div class="min-w-0 pr-2">
                <p class="font-black text-sm text-[#1A1A1A] truncate">{{ lot.ref }}</p>
                <p class="text-[8px] font-bold text-gray-400 uppercase mt-0.5 truncate">{{ lot.date }}</p>
              </div>
              <span class="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 shrink-0" 
                    :class="lot.status === 'Prêt' ? 'bg-[#D4AF37] text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-400 border-gray-100'">
                {{ lot.status }}
              </span>
            </div>

            <div class="p-4 flex flex-col gap-4 min-w-0">
              <div class="flex flex-col gap-1.5 min-w-0">
                <p class="text-[7px] font-black uppercase text-gray-400 tracking-widest truncate">Composition du lot</p>
                <div class="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                  <div v-for="doc in lot.docs" :key="doc" class="w-7 h-7 rounded-lg bg-[#F5F2ED] border border-black/5 flex items-center justify-center text-[9px] font-black text-[#D4AF37] shrink-0 shadow-sm">{{ doc }}</div>
                </div>
              </div>

              <div class="flex flex-col gap-1.5 min-w-0">
                <p class="text-[7px] font-black uppercase text-gray-400 tracking-widest truncate">Validation Qualité</p>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[7px] font-black border border-green-100 truncate">ISO 9001 Scellé</span>
                  <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[7px] font-black border border-blue-100 truncate">E-SIGNATURE eIDAS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 space-y-4 min-w-0">
         <div class="bg-black text-white p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden text-left min-w-0">
            <div class="absolute -right-4 -top-4 opacity-10 text-6xl">🛡️</div>
            <h3 class="text-base font-black mb-3 flex items-center gap-2 truncate">
               <span class="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center text-black text-[10px] shrink-0">IA</span>
               Sécurité Absolue
            </h3>
            <p class="text-[9px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
               Audit automatique (Gemini) <br>
               Vérification RGE/SIRENE temps réel <br>
               Scellement immuable.
            </p>
         </div>

         <div class="bg-[#F5F2ED] border-2 border-black p-6 rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center text-left min-w-0">
            <p class="text-[8px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-1 truncate">Support Dédié</p>
            <p class="text-xs font-bold text-[#1A1A1A] leading-tight">Besoin d'un audit spécifique ?</p>
            <button class="mt-4 py-3.5 bg-black text-[#D4AF37] rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">
               Contacter responsable
            </button>
         </div>
      </div>
    </div>


    <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-10 w-full min-w-0">
      
      <div class="flex justify-between items-end shrink-0">
        <div class="text-left">
          <h1 class="text-3xl font-black text-[#1A1A1A] tracking-tighter mb-2 uppercase italic">Audit des Stocks CEE</h1>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Accès Partenaire : Direction Conformité
          </p>
        </div>
        
        <div class="flex gap-4">
           <div class="px-6 py-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
              <p class="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Volume Cumulé</p>
              <p class="text-2xl font-black text-black tabular-nums">1.42 <span class="text-xs text-[#D4AF37]">GWh</span></p>
           </div>
           <div class="px-6 py-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
              <p class="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Dossiers Audités</p>
              <p class="text-2xl font-black text-black tabular-nums">128</p>
           </div>
        </div>
      </div>

      <div class="bg-white border-2 border-black rounded-[2.5rem] shadow-[10px_10px_0px_0px_rgba(212,175,55,0.1)] overflow-hidden shrink-0">
        <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
           <div class="text-left">
              <h2 class="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Flux de production en temps réel</h2>
              <p class="text-[10px] text-gray-400 font-bold uppercase mt-1">Transparence totale sur la constitution des dossiers</p>
           </div>
           <button class="px-6 py-3 bg-black text-[#D4AF37] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-transform hover:scale-105">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Télécharger l'Archive PNCEE (ZIP)
           </button>
        </div>

        <div class="p-0 overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white border-b border-gray-100">
                <th class="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Référence Lot</th>
                <th class="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Composition</th>
                <th class="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Contrôle Qualité</th>
                <th class="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="lot in dummyLots" :key="lot.id" class="hover:bg-gray-50 transition-colors">
                <td class="p-6">
                   <p class="font-black text-sm text-[#1A1A1A]">{{ lot.ref }}</p>
                   <p class="text-[9px] font-bold text-gray-400 uppercase mt-1">{{ lot.date }}</p>
                </td>
                <td class="p-6">
                   <div class="flex items-center gap-1.5">
                      <div v-for="doc in lot.docs" :key="doc" class="w-6 h-6 rounded bg-[#F5F2ED] border border-black/5 flex items-center justify-center text-[10px] font-black text-[#D4AF37]" :title="doc">{{ doc }}</div>
                   </div>
                </td>
                <td class="p-6 text-left">
                   <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[8px] font-black border border-green-200 uppercase">ISO 9001</span>
                      <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] font-black border border-blue-200 uppercase">E-SIGNATURE</span>
                   </div>
                </td>
                <td class="p-6 text-right">
                   <span class="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2" 
                         :class="lot.status === 'Prêt' ? 'bg-[#D4AF37] text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-400 border-gray-100'">
                      {{ lot.status }}
                   </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 shrink-0">
         <div class="bg-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden text-left">
            <div class="absolute top-0 right-0 p-8 opacity-10 text-8xl">🛡️</div>
            <h3 class="text-xl font-black mb-4 flex items-center gap-3 tracking-tighter uppercase italic">
               <span class="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black text-sm not-italic font-black">IA</span>
               Sécurité PNCEE Absolue
            </h3>
            <p class="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
               Chaque dossier de ce portail a subi un triple audit : <br>
               1. Reconnaissance automatique des documents (Gemini)<br>
               2. Vérification RGE & SIRENE en temps réel<br>
               3. Horodatage électronique et scellement blockchain.
            </p>
         </div>

         <div class="bg-[#F5F2ED] border-2 border-black p-8 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center text-left">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Support Dédié Obligé</p>
            <p class="text-sm font-bold text-[#1A1A1A] uppercase tracking-tighter italic">Besoin d'un audit spécifique sur un lot ?</p>
            <button class="mt-6 py-4 bg-black text-[#D4AF37] rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95">
               Contacter le responsable de lot
            </button>
         </div>
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
// ----------------------------------------------------

const dummyLots = ref([
  { id: 1, ref: 'LOT-2026-A42', date: '08 AVRIL 2026', docs: ['AH', 'BS', 'R2', 'TAX'], status: 'Prêt' },
  { id: 2, ref: 'LOT-2026-A43', date: '07 AVRIL 2026', docs: ['AH', 'BS', 'R2'], status: 'Audit IA...' },
  { id: 3, ref: 'LOT-2026-A44', date: '05 AVRIL 2026', docs: ['AH', 'BS'], status: 'Audit IA...' },
  { id: 4, ref: 'LOT-2026-A41', date: '01 AVRIL 2026', docs: ['AH', 'BS', 'R2', 'TAX'], status: 'Prêt' }
]);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }

.custom-scrollbar-hide::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
</style>