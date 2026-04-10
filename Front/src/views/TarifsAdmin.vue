<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col relative">
    
    <TheHeader pageTitle="Configuration Tarifaire" :showBackButton="false" />

    <div class="flex-1 flex flex-col max-w-5xl mx-auto w-full p-8 mt-4">
      
      <div class="flex justify-between items-end mb-8">
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

      <div v-else class="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex-1">
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
                  <input 
                    v-model.number="tarif.prixMwhClassique" 
                    type="number" 
                    step="0.10"
                    class="w-20 bg-gray-100 border border-gray-200 rounded-lg p-2 text-sm font-black text-center focus:border-black focus:bg-white outline-none transition-all"
                    @change="tarif.modified = true"
                  />
                  <span class="text-xs font-bold text-gray-400">€</span>
                </div>
              </td>

              <td class="p-4 text-center border-r border-gray-50 bg-white group-hover:bg-gray-50 transition-colors">
                 <div class="flex items-center justify-center gap-1">
                  <input 
                    v-model.number="tarif.prixMwhPrecaire" 
                    type="number" 
                    step="0.10"
                    class="w-20 bg-[#F5F2ED] border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg p-2 text-sm font-black text-center focus:border-[#D4AF37] focus:bg-white outline-none transition-all"
                    @change="tarif.modified = true"
                  />
                  <span class="text-xs font-bold text-gray-400">€</span>
                </div>
              </td>

              <td class="p-4 pr-6 text-right">
                <button 
                  v-if="tarif.modified"
                  @click="sauvegarderTarif(tarif)"
                  class="bg-black text-[#D4AF37] px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_rgba(212,175,55,0.4)] animate-fade-in"
                >
                  Mettre à jour
                </button>
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
import { ref, onMounted } from 'vue';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue';

const tarifs = ref([]);
const isLoading = ref(true);

const fetchTarifs = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/api/demo/tarifs');
    // On ajoute une propriété 'modified' locale pour afficher le bouton de sauvegarde conditionnellement
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
    tarif.modified = false; // On cache le bouton
    
    // Petit feedback visuel sympa (Optionnel)
    alert(`Tarifs pour la fiche ${tarif.codeFiche} mis à jour avec succès !`);
  } catch (error) {
    console.error("Erreur sauvegarde:", error);
    alert("Erreur lors de la mise à jour.");
  }
};

onMounted(() => fetchTarifs());
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>