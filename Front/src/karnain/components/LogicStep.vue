<template>
  <div class="h-full flex flex-col gap-8 animate-in">
    
    <div class="flex items-center justify-between px-2">
      <div>
        <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Intelligence Pipeline</h4>
        <h2 class="text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter italic">Vérification Logique</h2>
      </div>
      <div v-if="analysis" :class="analysis.isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'" class="px-6 py-3 rounded-2xl flex items-center gap-3 border border-current/10">
        <span class="w-2 h-2 rounded-full animate-pulse" :class="analysis.isValid ? 'bg-emerald-500' : 'bg-red-500'"></span>
        <span class="text-[10px] font-black uppercase tracking-widest">{{ analysis.isValid ? 'Document Conforme' : 'Anomalies Détectées' }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
      
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm h-fit">
          <h5 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-6">Rapport d'intégrité</h5>
          
          <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calculs en cours...</p>
          </div>

          <div v-else-if="analysis && analysis.errors && analysis.errors.length > 0" class="space-y-4">
            <div v-for="(error, i) in analysis.errors" :key="i" class="p-5 bg-red-50/50 border border-red-100 rounded-3xl flex items-start gap-4">
              <span class="text-xl">⚠️</span>
              <div>
                <p class="text-[11px] text-red-800 font-bold leading-relaxed">{{ error }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="analysis && analysis.isValid" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-3xl mb-4">✨</div>
            <p class="text-xs font-bold text-[#443E73] uppercase tracking-wide">Aucune erreur de calcul ou de cohérence détectée.</p>
            <p class="text-[10px] text-gray-400 mt-2">Les sommes et les dates correspondent aux patterns identifiés.</p>
          </div>
        </div>

        <div v-if="analysis && analysis.findings" class="bg-[#0D0B1A] rounded-[2.5rem] p-8 shadow-2xl">
          <h5 class="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-6">Détails de l'Audit IA</h5>
          <pre class="text-[11px] font-mono text-emerald-400/80 bg-black/20 p-6 rounded-2xl overflow-x-auto custom-scrollbar">{{ JSON.stringify(analysis.findings, null, 2) }}</pre>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-8">
          <h5 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-6">Contrôles IA</h5>
          <button @click="runAnalysis" :disabled="loading" class="w-full py-5 bg-[#1A1A1A] text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-3 mb-4">
             Relancer l'audit
          </button>
          <p class="text-[9px] text-gray-400 text-center leading-relaxed px-4">L'audit logique vérifie la cohérence des données extraites par rapport aux règles métier standard.</p>
        </div>

        <div class="p-8 bg-emerald-50/30 border border-emerald-100 rounded-[2.5rem]">
          <h5 class="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-4">Indice de confiance</h5>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-black text-emerald-600 leading-none">95</span>
            <span class="text-xl font-bold text-emerald-600/50 mb-1">%</span>
          </div>
          <div class="mt-4 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 w-[95%]"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '/services/api';

const props = defineProps({
  templateId: { type: String, required: true }
});

const analysis = ref(null);
const loading = ref(false);

const runAnalysis = async () => {
  loading.value = true;
  try {
    const res = await api.post('/api/logic-validations/analyze', { templateId: props.templateId });
    if (res.data.success) {
      analysis.value = res.data.logicData;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(runAnalysis);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>