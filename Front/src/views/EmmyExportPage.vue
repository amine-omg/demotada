<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-hidden">
    <TheHeader pageTitle="Contrôle PNCEE" :showBackButton="true" @back="$router.push('/emmy-index')" />

    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin"></div>
    </div>

    <div v-else-if="lot" class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
      
      <div class="mb-10">
        <h1 class="text-3xl font-black text-[#1A1A1A] tracking-tighter mb-2">Préparation du {{ lot.reference }}</h1>
        <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">Dossiers conformes en attente de dépôt au registre national</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm relative overflow-hidden">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 relative z-10">Volume à déposer</p>
          <p class="text-4xl font-black text-[#1A1A1A] relative z-10">{{ lot.dossierCount }} <span class="text-lg text-gray-400">dossiers</span></p>
        </div>
        <div class="bg-white p-8 rounded-[2rem] border border-[#D4AF37]/30 shadow-sm relative overflow-hidden">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-2 relative z-10">Total kWh Cumac</p>
          <p class="text-4xl font-black text-[#1A1A1A] relative z-10 font-mono tracking-tighter">{{ lot.volumeGwh }} <span class="text-lg text-[#D4AF37] font-sans">GWh</span></p>
        </div>
        <div class="bg-[#1A1A1A] p-8 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 relative z-10">Valeur estimée du lot</p>
          <p class="text-4xl font-black text-white relative z-10 font-mono tracking-tighter">{{ lot.valeurEstimee.toLocaleString('fr-FR') }} <span class="text-lg text-[#D4AF37] font-sans">€</span></p>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col lg:flex-row overflow-hidden min-h-[500px]">
        <div class="w-full lg:w-1/2 bg-gray-50/50 border-r border-gray-200 flex flex-col relative">
          <div class="p-6 border-b border-gray-200 bg-white shadow-sm">
             <h2 class="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">Aperçu du lot (Extrait)</h2>
          </div>
          <div class="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
             <div v-for="i in 5" :key="i" class="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-4">
                   <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-xs text-gray-400">#{{ i }}</div>
                   <div>
                      <p class="text-xs font-black text-[#1A1A1A]">Dossier CEE audité</p>
                   </div>
                </div>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
             </div>
          </div>
        </div>

        <div class="w-full lg:w-1/2 bg-white flex flex-col p-8 md:p-12">
          <div class="mb-10">
            <h2 class="text-xl font-black text-[#1A1A1A] mb-2">Contrôle PNCEE</h2>
          </div>

          <div class="flex-1 bg-[#1A1A1A] rounded-2xl p-6 font-mono text-xs overflow-hidden flex flex-col shadow-inner">
             <div class="text-gray-500 mb-4 border-b border-gray-800 pb-2 uppercase tracking-widest text-[9px] font-sans font-bold">Terminal EMMY</div>
             
             <div class="flex-1 space-y-3">
               <p v-if="step >= 0" class="text-gray-400">> Validation {{ lot.reference }}...</p>
               <p v-if="step >= 1" class="text-white flex justify-between">
                 <span>> Signature eIDAS</span><span :class="step > 1 ? 'text-green-400' : 'text-amber-400'">{{ step > 1 ? 'OK' : '...' }}</span>
               </p>
               <p v-if="step >= 2" class="text-white flex justify-between">
                 <span>> API ADEME (RGE)</span><span :class="step > 2 ? 'text-green-400' : 'text-amber-400'">{{ step > 2 ? 'OK' : '...' }}</span>
               </p>
               <p v-if="step >= 3" class="text-white flex justify-between">
                 <span>> Scellement ISO</span><span :class="step > 3 ? 'text-green-400' : 'text-amber-400'">{{ step > 3 ? 'Terminé' : '...' }}</span>
               </p>

               <div v-if="step >= 4" class="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center animate-fade-in">
                 <p class="font-bold text-sm">ARCHIVE SCELLÉE ET DÉPOSÉE</p>
               </div>
             </div>
          </div>

          <div class="mt-8">
             <button v-if="step === 0 && lot.status === 'draft'" @click="startGeneration" class="w-full py-5 bg-[#D4AF37] hover:bg-[#b5952f] text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all">
                Générer et Déposer
             </button>
             <button v-else-if="step >= 4 || lot.status !== 'draft'" @click="$router.push('/emmy-index')" class="w-full py-5 bg-[#1A1A1A] hover:bg-black text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all">
                Retour aux Lots
             </button>
             <div v-else class="w-full py-5 bg-gray-100 text-gray-400 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex justify-center items-center">
                Opération en cours...
             </div>
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
const lot = ref(null);
const isLoading = ref(true);
const step = ref(0);

onMounted(async () => {
  try {
    const res = await api.get(`/api/demo/lots/${route.params.id}`);
    lot.value = res.data.data;
    if (lot.value.status !== 'draft') {
      step.value = 4; // Déjà validé
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const startGeneration = async () => {
  step.value = 1;
  setTimeout(() => { step.value = 2; }, 1000);
  setTimeout(() => { step.value = 3; }, 2000);
  setTimeout(async () => { 
    step.value = 4; 
    // MISE A JOUR EN BASE DE DONNÉES !
    await api.put(`/api/demo/lots/${lot.value._id}/status`, { status: 'deposited' });
    lot.value.status = 'deposited';
  }, 3000); 
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>