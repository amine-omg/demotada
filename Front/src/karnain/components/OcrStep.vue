<template>
  <div class="h-full flex flex-col lg:flex-row gap-8 animate-in">
    
    <div class="lg:w-1/2 flex flex-col h-full">
      <div class="flex items-center justify-between mb-4 px-2">
        <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
          Raw Text Stream
        </h4>
        <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
          {{ fullText.length }} caractères
        </span>
      </div>

      <div class="flex-grow bg-[#0D0B1A] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 relative overflow-hidden flex flex-col">
        <div ref="scrollBox" class="flex-1 overflow-y-auto custom-scrollbar font-mono text-[12px] leading-relaxed text-emerald-400/90">
          <div class="whitespace-pre-wrap">{{ displayedText }}</div>
          <div v-if="isStreaming" class="w-2 h-4 bg-emerald-500 animate-pulse inline-block ml-1"></div>
        </div>
      </div>
    </div>

    <div class="lg:w-1/2 flex flex-col h-full">
      <div class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm h-full flex flex-col">
        
        <div class="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Intelligence Mapping</span>
            <h4 class="text-xs font-black text-[#443E73] uppercase tracking-[0.1em]">Analyse Sémantique</h4>
          </div>
          <div class="flex gap-2">
            <button @click="runSemantic" :disabled="loading" class="p-2 bg-white border border-gray-200 rounded-xl hover:text-emerald-500 transition-all shadow-sm">
              <span class="text-[9px] font-black uppercase tracking-widest">🤖 IA</span>
            </button>
            <button @click="runLogic" :disabled="loading" class="p-2 bg-white border border-gray-200 rounded-xl hover:text-purple-500 transition-all shadow-sm">
              <span class="text-[9px] font-black uppercase tracking-widest">📐 Logique</span>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
          <div v-if="!extractedData || Object.keys(extractedData).length === 0" class="flex flex-col items-center justify-center h-full text-center p-10">
            <div class="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-3xl mb-4">🧠</div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              En attente d'intelligence...<br>Lancez un moteur IA pour structurer.
            </p>
          </div>

          <div v-for="(value, key) in extractedData" :key="key" 
               class="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl hover:border-emerald-500/20 transition-all group flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <span class="text-[7px] font-black text-emerald-600 uppercase tracking-widest">{{ key }}</span>
              <span class="text-[11px] text-[#443E73] font-bold">{{ value }}</span>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="px-2 py-1 bg-white border border-gray-100 rounded text-[7px] font-bold text-gray-300 uppercase">Propriété Map</span>
            </div>
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

const fullText = ref("");
const displayedText = ref("");
const extractedData = ref({});
const loading = ref(false);
const isStreaming = ref(false);
const scrollBox = ref(null);

const startStreaming = (text) => {
  if (!text) return;
  isStreaming.value = true;
  displayedText.value = "";
  let i = 0;
  const stream = () => {
    if (i < text.length) {
      displayedText.value += text[i];
      i++;
      if (scrollBox.value && i % 20 === 0) scrollBox.value.scrollTop = scrollBox.value.scrollHeight;
      setTimeout(stream, 2);
    } else {
      isStreaming.value = false;
    }
  };
  stream();
};

const fetchData = async () => {
  try {
    const ocrRes = await api.get(`/api/ocr/template/${props.templateId}`);
    const ocrData = Array.isArray(ocrRes.data) ? ocrRes.data[0] : ocrRes.data;
    
    if (ocrData) {
      fullText.value = ocrData.fullText || "";
      startStreaming(fullText.value);
    }

    const semRes = await api.get(`/api/semantics/template/${props.templateId}`);
    if (semRes.data && semRes.data.extractedData) {
      extractedData.value = semRes.data.extractedData;
    }
  } catch (err) {
    console.error(err);
  }
};

const runSemantic = async (isForced = false) => {
  if (!fullText.value && !isForced) {
    console.error("Aucun texte source disponible pour l'analyse.");
    return;
  }

  loading.value = true;
  try {
    const res = await api.post('/api/semantics/identify', { 
      templateId: props.templateId,
      forceRefresh: isForced 
    });
    
    if (res.data.success) {
      extractedData.value = res.data.extractedData;
      console.log(res.data.cached ? "✅ Données récupérées du cache" : "🤖 Analyse Gemini terminée");
    }
  } catch (err) {
    console.error("Erreur lors de l'identification :", err.response?.data?.message || err.message);
  } finally {
    loading.value = false;
  }
};

const runLogic = async () => {
  loading.value = true;
  try {
    const res = await api.post('/api/logic-validation/analyze', { templateId: props.templateId });
    console.log("Analyse logique terminée", res.data);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>