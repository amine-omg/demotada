<template>
  <div class="min-h-screen bg-gray-50/50 font-sans">
    <TheHeader pageTitle="Karnain Engine v3" :showBackButton="false" />

    <main class="p-6 md:p-12">
      
      <div class="mb-10 text-center">
        <h1 class="text-4xl font-black text-gray-600 tracking-tighter flex flex-col md:flex-row justify-center items-center gap-3 uppercase italic">
          Template Generator
          <span class="text-[10px] w-fit uppercase tracking-[0.3em] px-3 py-1 bg-[#E5E5D1] text-[#050505] rounded-full font-black shadow-[0_0_15px_rgba(229,229,209,0.3)] not-italic">
            Karnain Engine V3
          </span>
        </h1>
        <p class="text-gray-500 font-medium mt-3 text-lg">
          Transformez n'importe quel PDF en template éditable à l'identique.
        </p>
      </div>

      <div class="mb-12">
        <UploadDropzone 
          :isUploading="isAnalyzing" 
          @file-selected="handleMagicClone" 
        />
      </div>

      <div v-if="isAnalyzing" class="bg-white rounded-[2rem] p-8 shadow-xl border border-white flex flex-col items-center mb-12 animate-in">
        <div class="w-full max-w-2xl text-center">
          <div class="flex justify-between mb-3 px-1">
            <span class="text-[#443E73] font-black text-xs uppercase tracking-widest">Envoi et création de la miniature...</span>
            <span class="text-[#FF8B7D] font-black text-sm">{{ progress }}%</span>
          </div>
          <div class="h-3 w-full bg-gray-100 rounded-full p-1 shadow-inner">
            <div 
              class="h-full bg-gradient-to-r from-[#B2E9E1] to-[#FF8B7D] rounded-full transition-all duration-300" 
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="w-full">
        <h2 class="text-xs font-black text-gray-600 uppercase tracking-[0.3em] italic mb-6">
          Pipeline de clonage
        </h2>

        <div v-if="templates.length === 0 && !loading" class="text-center py-20 bg-white/40 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 italic font-medium">
          Aucun document n'est passé par le moteur Karnain pour le moment.
        </div>

        <div class="space-y-4">
          <div v-for="template in templates" :key="template.id" 
               class="bg-white rounded-[2rem] p-5 border border-[#E5E5D1] flex flex-col lg:flex-row items-center justify-between hover:border-[#D8D8C4] hover:shadow-md transition-all duration-500 group mb-4 relative overflow-hidden shadow-sm">
            
            <div class="flex items-center gap-6 flex-1 min-w-[250px] relative z-10">
              <div class="w-16 h-20 bg-[#FDFCFB] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E5E5D1] shadow-inner overflow-hidden relative">
                <img :src="`http://localhost:3000/uploads/backgrounds/${template.id}_p1.png`" class="w-full h-full object-cover" @error="(e) => e.target.style.opacity='0'" />
                <span class="absolute text-2xl opacity-10">📄</span>
              </div>
              <div class="truncate">
                <h3 class="font-black text-[#1A1A1A] text-lg truncate leading-tight uppercase tracking-tighter italic">{{ template.name || 'Document Karnain' }}</h3>
                <p class="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">ID: {{ template.id }}</p>
              </div>
            </div>

            <div class="flex-grow flex items-center gap-6 px-8 py-4 my-4 lg:my-0 lg:mx-6 border-y lg:border-y-0 lg:border-x border-[#E5E5D1] bg-[#FDFCFB] rounded-2xl relative z-10">
              
              <button 
                @click="handleSmartAction(template)" 
                class="px-6 py-3 bg-[#1A1A1A] text-[#E5E5D1] rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-black hover:scale-105 transition-all shadow-sm"
              >
                {{ template.progress?.ocr === 'complete' ? 'Analyser doc' : 'Scanner doc' }}
              </button>
              
              <div class="flex items-center gap-6 md:gap-8 ml-2">
                <div v-for="step in pipelineSteps" :key="step.key" class="flex flex-col items-center">
                  <span class="text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest">{{ step.label }}</span>
                  <div 
                    @click="openInspectModal(template.id, step.key, template.progress?.[step.key] || 'none')"
                    class="w-3 h-3 rounded-full shadow-sm transition-all duration-500 border border-white" 
                    :class="[
                      (step.key === 'master' && template.progress?.[step.key] === 'complete') 
                        ? 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                        : getStatusColor(template.progress?.[step.key] || 'none'),
                      (template.progress?.[step.key] === 'complete') ? 'cursor-pointer hover:scale-150 hover:shadow-lg' : 'cursor-not-allowed opacity-50'
                    ]" 
                    :title="step.label">
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pl-4 relative z-10">
              <a v-if="template.url" :href="template.url" target="_blank" class="p-3 text-slate-400 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-xl transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </a>
              <button @click="handleDelete(template.id)" class="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BackgroundMagic 
      v-if="activeMagicId" 
      :isOpen="!!activeMagicId" 
      :templateId="activeMagicId" 
      :sourceImageUrl="`http://localhost:3000/uploads/backgrounds/${activeMagicId}_p1.png`"
      @close="activeMagicId = null" 
      @refresh="fetchTemplates" 
    />
    
    <div v-if="activeInspectModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0B1A]/95 backdrop-blur-xl p-6">
      <div class="bg-white rounded-[3.5rem] shadow-2xl max-w-7xl w-full h-[85vh] overflow-hidden border-4 border-white flex flex-col relative animate-in">
        <button @click="activeInspectModal = null" class="absolute top-8 right-10 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-black shadow-sm">✕</button>
        
        <div class="flex-grow overflow-y-auto p-12 relative z-50">
          <MetadataStep v-if="activeInspectModal.step === 'layout'" :templateId="activeInspectModal.templateId" />
          <VectorStep v-else-if="activeInspectModal.step === 'vectors'" :templateId="activeInspectModal.templateId" />
          <OcrStep v-else-if="activeInspectModal.step === 'ocr'" :templateId="activeInspectModal.templateId" />
          
          <div v-else-if="activeInspectModal.step === 'master'" class="w-full h-full flex flex-col items-center justify-center bg-[#0D0B1A] rounded-[2.5rem] p-8">
            <h2 class="text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em] mb-6">Master Page (Background Vierge)</h2>
            <div class="relative w-full flex-1 bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
              <img :src="`http://localhost:3000/uploads/backgrounds/${activeInspectModal.templateId}_master.png`" class="max-w-full max-h-full object-contain p-4" />
            </div>
          </div>

          <div v-else class="flex h-full items-center justify-center text-gray-400 font-black tracking-widest uppercase italic">
            Analyse {{ activeInspectModal.step }} en attente de déploiement...
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '/services/api'; 
import TheHeader from '../../components/TheHeader.vue'; 
import UploadDropzone from '../components/UploadDropzone.vue';
import BackgroundMagic from '../components/BackgroundMagic.vue'; 
import LayoutStep from '../components/LayoutStep.vue';
import MetadataStep from '../components/MetadataStep.vue'; 
import VectorStep from '../components/VectorStep.vue'; 
import OcrStep from '../components/OcrStep.vue';

const activeInspectModal = ref<{ templateId: string, step: string } | null>(null);

const openInspectModal = (templateId: string, step: string, status: string) => {
  if (status === 'complete') {
    activeInspectModal.value = { templateId, step };
  }
};

const templates = ref<any[]>([]);
const isAnalyzing = ref(false);
const loading = ref(true);
const progress = ref(0);
const activeMagicId = ref<string | null>(null);

// Ajout de la clé 'master'
const pipelineSteps = [
  { key: 'layout', label: 'Meta' },
  { key: 'vectors', label: 'Vector' },
  { key: 'ocr', label: 'Text' },
  { key: 'master', label: 'Deep' },
  { key: 'logic', label: 'Logic' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'complete': return 'bg-[#B2E9E1] shadow-[0_0_8px_rgba(178,233,225,0.8)]';
    case 'error': case 'failed': return 'bg-[#FF8B7D] shadow-[0_0_8px_rgba(255,139,125,0.8)]';
    case 'pending': case 'processing': return 'bg-amber-400 animate-pulse';
    default: return 'bg-gray-200';
  }
};

const handleSmartAction = (template) => {
  activeMagicId.value = template.id; // Ouvre TOUJOURS le grand modal noir
};

const fetchTemplates = async () => {
  try {
    loading.value = true;
    const res = await api.get('/api/upload/list');
    const data = Array.isArray(res.data) ? res.data : (res.data.templates || []);
    
    // Ajout de 'master' dans les valeurs par défaut
    const defaultProgress = { layout: 'none', vectors: 'none', ocr: 'none', master: 'none', logic: 'none' };

    templates.value = data.map((t: any) => ({
      ...t,
      id: t._id || t.id,
      progress: { ...defaultProgress, ...(t.progress || {}) }
    }));
  } catch (e) {
    console.error("Erreur lors du rafraîchissement de la liste:", e);
  } finally {
    loading.value = false;
  }
};

const handleMagicClone = async (file: File) => {
  if (isAnalyzing.value) return;
  isAnalyzing.value = true;
  progress.value = 10;
  
  try {
    const formData = new FormData();
    formData.append('file', file);

    await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      }
    });
    
    await fetchTemplates();
  } catch (e: any) {
    alert("Erreur: " + (e.response?.data?.message || e.message));
  } finally {
    isAnalyzing.value = false;
    setTimeout(() => progress.value = 0, 1000);
  }
};

const handleDelete = async (templateId: string) => {
  if (!confirm("Voulez-vous supprimer définitivement ce document ?")) return;
  try {
    await api.delete(`/api/upload/${templateId}`);
    templates.value = templates.value.filter(t => t.id !== templateId);
  } catch (e) {
    alert("Impossible de supprimer le document.");
  }
};

onMounted(fetchTemplates);
</script>

<style scoped>
.animate-in {
  animation: slideUp 0.4s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>