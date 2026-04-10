<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'min-h-screen'" class="w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden relative min-w-0">
    
    <TheHeader pageTitle="Configuration Tarifaire" :showBackButton="false" class="shrink-0 w-full z-40" />

    <div v-if="isMobile" class="flex-1 flex flex-col overflow-y-auto w-full p-4 pb-24 min-w-0 custom-scrollbar-hide">
      
      <div class="mb-6 shrink-0 min-w-0">
        <span class="text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37] block">Administration Système</span>
        <h1 class="text-2xl font-black tracking-tighter mt-1 truncate">Moteur Pricing CEE</h1>
        <p class="text-[10px] text-gray-500 font-bold mt-2 leading-relaxed">Définissez la valeur d'achat du MWh Cumac par fiche.</p>
      </div>

      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-12 min-w-0">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4 shrink-0"></div>
        <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Chargement...</p>
      </div>

      <div v-else class="flex flex-col gap-5 min-w-0">
        <div v-for="tarif in tarifs" :key="tarif._id" 
             class="bg-white border-2 border-black rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative min-w-0 w-full">
          
          <div class="p-5 flex flex-col gap-4 min-w-0">
            <div class="flex flex-col gap-1 min-w-0">
              <div class="flex justify-between items-start gap-2 min-w-0">
                <p class="font-black text-sm uppercase text-[#1A1A1A] truncate">{{ tarif.codeFiche }}</p>
                <span class="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[7px] font-black uppercase tracking-wider">
                  {{ tarif.secteur }}
                </span>
              </div>
              <p class="text-[9px] text-gray-400 font-bold truncate block w-full">{{ tarif.nomFiche }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3 min-w-0 pt-2 border-t border-gray-50">
              <div class="space-y-1.5 min-w-0">
                <label class="text-[7px] font-black text-gray-400 uppercase tracking-widest block truncate">Classique</label>
                <div class="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                  <input 
                    v-model.number="tarif.prixMwhClassique" 
                    type="number" 
                    step="0.10"
                    class="w-full bg-transparent text-sm font-black text-center outline-none"
                    @change="tarif.modified = true"
                  />
                  <span class="text-[9px] font-black text-gray-400">€</span>
                </div>
              </div>

              <div class="space-y-1.5 min-w-0">
                <label class="text-[7px] font-black text-[#D4AF37] uppercase tracking-widest block truncate">Précaire</label>
                <div class="flex items-center gap-1.5 bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-xl p-2.5">
                  <input 
                    v-model.number="tarif.prixMwhPrecaire" 
                    type="number" 
                    step="0.10"
                    class="w-full bg-transparent text-sm font-black text-center text-[#D4AF37] outline-none"
                    @change="tarif.modified = true"
                  />
                  <span class="text-[9px] font-black text-[#D4AF37]/60">€</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="tarif.modified" class="bg-gray-50 border-t-2 border-black p-3 animate-fade-in shrink-0">
            <button 
              @click="sauvegarderTarif(tarif)"
              class="w-full bg-black text-[#D4AF37] py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(212,175,55,0.4)] active:scale-95 transition-all"
            >
              Mettre à jour
            </button>
          </div>
          <div v-else class="bg-gray-50/50 border-t border-gray-100 p-2 text-center shrink-0">
            <span class="text-[8px] font-black uppercase tracking-widest text-gray-300">Valeurs à jour</span>
          </div>
        </div>
      </div>
    </div>


    <div v-else class="flex-1 flex flex-col max-w-5xl mx-auto w-full p-8 mt-4 overflow-y-auto min-w-0">
      
      <div class="flex justify-between items-end mb-8 shrink-0">
        <div>
          <span class="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Administration Système</span>
          <h1 class="text-3xl font-black tracking-tighter mt-1">Moteur Pricing CEE</h1>
          <p class="text-xs text-gray-500 font-medium mt-2">Définissez la valeur d'achat du MWh Cumac. Ces valeurs impacteront directement les simulations.</p>
        </div>
      </div>

      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Chargement des tarifs...</p>
      </div>

      <div v-else class="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex-1 min-w-0">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#1A1A1A] border-b-2 border-black text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">
              <th class="p-4 pl-6 w-1/3">Fiche CEE & Secteur</th>
              <th class="p-4 text-center">Valeur MWh Classique (€)</th>
              <th class="p-4 text-center">Valeur MWh Précaire (€)</th>
              <th class="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tarif in tarifs" :key="tarif._id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <td class="p-4 pl-6 border-r border-gray-50">
                <p class="font-black text-sm uppercase text-[#1A1A1A]">{{ tarif.codeFiche }}</p>
                <p class="text-[10px] text-gray-500 font-bold truncate max-w-[250px]">{{ tarif.nomFiche }}</p>
                <span class="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[8px] font-black uppercase tracking-wider">
                  {{ tarif.secteur }}
                </span>
              </td>
              <td class="p-4 text-center border-r border-gray-50 bg-white group-hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-center gap-1">
                  <input v-model.number="tarif.prixMwhClassique" type="number" step="0.10" class="w-20 bg-gray-100 border border-gray-200 rounded-lg p-2 text-sm font-black text-center focus:border-black focus:bg-white outline-none transition-all" @change="tarif.modified = true" />
                  <span class="text-xs font-bold text-gray-400">€</span>
                </div>
              </td>
              <td class="p-4 text-center border-r border-gray-50 bg-white group-hover:bg-gray-50 transition-colors">
                 <div class="flex items-center justify-center gap-1">
                  <input v-model.number="tarif.prixMwhPrecaire" type="number" step="0.10" class="w-20 bg-[#F5F2ED] border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg p-2 text-sm font-black text-center focus:border-[#D4AF37] focus:bg-white outline-none transition-all" @change="tarif.modified = true" />
                  <span class="text-xs font-bold text-gray-400">€</span>
                </div>
              </td>
              <td class="p-4 pr-6 text-right">
                <button v-if="tarif.modified" @click="sauvegarderTarif(tarif)" class="bg-black text-[#D4AF37] px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_rgba(212,175,55,0.4)] animate-fade-in">Mettre à jour</button>
                <span v-else class="text-[9px] font-black uppercase tracking-widest text-gray-300">À jour</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue';

// ---- GESTION DU RESPONSIVE (Render Adaptatif) ----
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // 768px = point de bascule standard
};

const tarifs = ref([]);
const isLoading = ref(true);

const fetchTarifs = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/api/demo/tarifs');
    tarifs.value = res.data.data.map(t => ({ ...t, modified: false }));
  } catch (error) {
    console.error("Erreur chargement tarifs:", error);
  } finally {
    isLoading.value = false;
  }
};

const sauvegarderTarif = async (tarif) => {
  try {
    await api.put(`/api/demo/tarifs/${tarif._id}`, {
      prixMwhClassique: tarif.prixMwhClassique,
      prixMwhPrecaire: tarif.prixMwhPrecaire
    });
    tarif.modified = false;
    alert(`Tarifs pour la fiche ${tarif.codeFiche} mis à jour avec succès !`);
  } catch (error) {
    alert("Erreur lors de la mise à jour.");
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchTarifs();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>