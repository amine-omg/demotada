<template>
  <div class="bg-white rounded-[2rem] p-5 border border-[#E5E5D1] flex flex-col lg:flex-row items-center justify-between hover:border-[#D8D8C4] hover:shadow-md transition-all duration-500 group mb-4 relative overflow-hidden shadow-sm">
    
    <div class="flex items-center gap-6 flex-1 min-w-[250px] relative z-10">
      <div class="w-16 h-20 bg-[#FDFCFB] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E5E5D1] shadow-inner overflow-hidden relative">
        <img 
          v-if="template.id" 
          :src="`http://localhost:3000/uploads/backgrounds/${template.id}_p1.png`" 
          class="w-full h-full object-cover"
          @error="(e) => e.target.style.opacity='0'"
        />
        <span class="absolute text-2xl opacity-20">📄</span>
      </div>
      
      <div class="truncate">
        <h3 class="font-black text-[#1A1A1A] text-lg truncate leading-tight uppercase tracking-tighter italic">
          {{ template.name || 'Sans titre' }}
        </h3>
        <p class="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
          ID: {{ template.id ? template.id.substring(0, 8) : 'N/A' }}
        </p>
      </div>
    </div>

    <div class="flex-grow flex items-center gap-6 px-8 py-4 my-4 lg:my-0 lg:mx-6 border-y lg:border-y-0 lg:border-x border-[#E5E5D1] bg-[#FDFCFB] rounded-2xl relative z-10">
      
      <button 
        @click="runFullGeneration"
        :disabled="isGenerating"
        class="px-6 py-3 bg-[#1A1A1A] text-[#E5E5D1] rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-black hover:scale-105 transition-all shadow-sm disabled:opacity-50"
      >
        {{ isGenerating ? 'Moteur...' : 'Générer' }}
      </button>

      <div class="flex items-center gap-4">
        <PipelineStep label="Layout" :status="getStepStatus('layout')" @run-step="openStepDetail('layout')" />
        <PipelineStep label="Vectors" :status="getStepStatus('vectors')" @run-step="openStepDetail('vectors')" />
        <PipelineStep label="OCR" :status="getStepStatus('ocr')" @run-step="openStepDetail('ocr')" />
        <PipelineStep label="Logique" :status="getStepStatus('logic')" @run-step="openStepDetail('logic')" />
        <PipelineStep label="Style" :status="getStepStatus('style')" />
      </div>

      <button 
        :disabled="!isFullyMapped"
        @click="openTemplateEditor"
        class="ml-2 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-500"
        :class="isFullyMapped 
          ? 'bg-[#E5E5D1] text-[#1A1A1A] shadow-[0_0_20px_rgba(229,229,209,0.4)] hover:scale-105 opacity-100' 
          : 'bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed'"
      >
        {{ isFullyMapped ? 'Voir Template' : 'Mapping...' }}
      </button>
    </div>

    <div class="flex items-center gap-2 pl-4 relative z-10">
      <a v-if="template.url" :href="template.url" target="_blank" class="p-3 text-slate-400 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-xl transition-all">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      </a>
      <button @click="$emit('delete', template.id)" class="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>

    <div v-if="activeModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0B1A]/95 backdrop-blur-xl p-6">
      <div class="bg-white rounded-[3.5rem] shadow-2xl max-w-7xl w-full h-[85vh] overflow-hidden border-4 border-white flex flex-col relative animate-in fade-in zoom-in duration-300">
        <button @click="activeModal = null" class="absolute top-8 right-10 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 transition-all font-black">✕</button>
        <div class="flex-grow overflow-y-auto p-12">
          <LayoutStep v-if="activeModal === 'layout'" :templateId="template.id" :status="getStepStatus('layout')" />
          <VectorStep v-if="activeModal === 'vectors'" :templateId="template.id" :status="getStepStatus('vectors')" :isEmbedded="true" />
          <OcrStep v-if="activeModal === 'ocr'" :templateId="template.id" />
          <div v-if="activeModal === 'logic'" class="text-center p-20 text-slate-400 italic font-black uppercase tracking-widest">Logic View Configuration...</div>
        </div>
      </div>
    </div>

    <BackgroundMagic 
      v-if="isMagicOpen"
      :isOpen="isMagicOpen"
      :templateId="template.id"
      :sourceImageUrl="`http://localhost:3000/uploads/backgrounds/${template.id}_p1.png`"
      @close="isMagicOpen = false"
      @refresh="$emit('refresh')"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '/services/api'; 
import PipelineStep from '../views/PipelineStep.vue'; // CORRECT : Ton import dans views
import BackgroundMagic from './BackgroundMagic.vue';
import LayoutStep from './LayoutStep.vue';
import VectorStep from './VectorStep.vue';
import OcrStep from './OcrStep.vue';

const props = defineProps({
  template: { type: Object, required: true }
});

const emit = defineEmits(['refresh', 'delete']);

const isMagicOpen = ref(false);
const isGenerating = ref(false);
const activeModal = ref(null);

const isFullyMapped = computed(() => {
  const p = props.template.progress;
  if (!p) return false;
  return p.layout === 'complete' && p.vectors === 'complete' && p.ocr === 'complete' && p.logic === 'complete';
});

const getStepStatus = (step) => {
  return props.template.progress?.[step] || 'none';
};

const openStepDetail = (step) => {
  console.log('Ouverture du détail pour :', step);
  activeModal.value = step; 
};

const runFullGeneration = async () => {
  if (isGenerating.value) return;
  isMagicOpen.value = true;
  isGenerating.value = true;
  try {
    await api.post('/api/layout', { templateId: props.template.id });
    emit('refresh'); 
    await api.post('/api/vectors/extract', { templateId: props.template.id });
    emit('refresh');
  } catch (e) {
    console.error("Engine failure:", e);
  } finally {
    isGenerating.value = false;
  }
};

const openTemplateEditor = () => {
  console.log("Editeur:", props.template.id);
};
</script>