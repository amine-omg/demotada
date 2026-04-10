<template>
  <div class="h-full flex flex-col lg:flex-row gap-8 animate-in">
    
    <div class="lg:w-1/3 flex flex-col">
      <div class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        
        <div class="p-6 space-y-4">
          <div class="flex flex-col gap-1">
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Document Source</span>
            <span class="text-[11px] font-bold text-[#443E73] truncate">
              {{ analysisDetails?.sourceMetadata?.producer || 'Standard System Engine' }}
            </span>
          </div>
          
          <div class="h-px bg-gray-50"></div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Created</span>
              <span class="text-[10px] font-bold text-indigo-600">{{ formatDate(analysisDetails?.sourceMetadata?.createDate) || 'Analyzing...' }}</span>
            </div>
            <div>
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">PDF Version</span>
              <span class="text-[10px] font-bold text-[#443E73]">v{{ analysisDetails?.fileInfo?.pdfVersion || '1.7' }}</span>
            </div>
          </div>
        </div>

        <div class="px-6 pb-5 grid grid-cols-2 gap-4">
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">File Size</span>
            <span class="text-[10px] font-bold text-[#443E73]">{{ analysisDetails?.fileInfo?.filesize || '0 KB' }}</span>
          </div>
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Linearized</span>
            <span class="text-[10px] font-bold" :class="analysisDetails?.fileInfo?.isLinearized ? 'text-emerald-500' : 'text-amber-500'">
              {{ analysisDetails?.fileInfo?.isLinearized ? 'Yes (Optimized)' : 'No' }}
            </span>
          </div>
        </div>

        <div class="bg-gray-50/50 p-6 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Raster Quality</span>
            <div class="flex items-center gap-1">
              <span class="text-xs font-black text-emerald-500">{{ getMaxPpi() }}</span>
              <span class="text-[8px] font-bold text-emerald-500/50 uppercase">DPI</span>
            </div>
          </div>
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Elements</span>
            <span class="text-xs font-black text-[#443E73]">{{ analysisDetails?.images?.length || 0 }} <span class="text-[8px] opacity-40 italic ml-1">obj</span></span>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-white flex items-center gap-3">
          <button class="flex-1 h-9 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 hover:border-indigo-100 hover:text-indigo-200 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </button>
          <button class="w-12 h-9 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 hover:border-indigo-100 hover:text-indigo-200 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        <div class="bg-[#443E73] p-6 shadow-inner">
          <div class="flex justify-between items-center mb-2">
            <span class="text-[8px] font-black text-indigo-200 uppercase tracking-[0.15em]">System Fingerprint</span>
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <code class="font-mono text-[9px] text-white/80 break-all leading-tight block select-all">
            {{ analysisDetails?.fileInfo?.checksum || 'CALCULATING_HASH...' }}
          </code>
        </div>
      </div>
    </div>

    <div class="lg:w-2/3 flex flex-col h-full">
      <div class="flex items-center justify-between mb-4 pl-2">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full" :class="localStatus === 'complete' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"></div>
          <span class="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
            {{ localStatus === 'complete' ? 'Layout Sync Ready' : 'Mapping structure...' }}
          </span>
        </div>
      </div>

      <div class="flex-grow bg-[#F8F9FD] rounded-[3rem] border border-gray-100 shadow-inner relative flex items-center justify-center overflow-hidden min-h-[450px]">
        <div class="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style="background-image: linear-gradient(#443E73 1px, transparent 1px), linear-gradient(90deg, #443E73 1px, transparent 1px); background-size: 40px 40px;"></div>
        
        <div v-if="analysisDetails" class="relative group scale-95 lg:scale-100 transition-transform">
          <div class="relative w-[240px] h-[339px] bg-white shadow-[0_30px_60px_-15px_rgba(68,62,115,0.2)] rounded-sm border border-gray-200 animate-in">
            
            <div class="absolute inset-[15px] border border-dashed border-indigo-200 bg-indigo-50/10 flex items-center justify-center group-hover:bg-indigo-50/30 transition-colors">
              <div class="absolute -top-4 left-0 right-0 flex justify-between px-2 text-[7px] font-bold text-indigo-300"><span>15mm</span><span>15mm</span></div>
              <div class="absolute top-0 bottom-0 -left-4 flex flex-col justify-between py-2 text-[7px] font-bold text-indigo-300 rotate-180" style="writing-mode: vertical-rl;"><span>15mm</span><span>15mm</span></div>
              
              <div class="absolute inset-0 flex items-center justify-center opacity-10">
                <div class="w-full h-px bg-indigo-500"></div>
                <div class="h-full w-px bg-indigo-500 absolute"></div>
              </div>
            </div>

            <div class="absolute -right-14 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-black text-[#443E73]/30 tracking-widest">
              {{ analysisDetails?.pages?.[0]?.height }}mm
            </div>
            <div class="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#443E73]/30 tracking-widest">
              {{ analysisDetails?.pages?.[0]?.width }}mm
            </div>

            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
              <div class="px-6 py-2 bg-[#443E73] text-white text-[10px] font-black rounded-xl shadow-2xl uppercase tracking-[0.3em] border-[3px] border-white group-hover:scale-110 transition-transform">
                {{ analysisDetails?.pages?.[0]?.orientation || 'Portrait' }}
              </div>
              <div class="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                <span class="text-[11px] font-black text-[#443E73]">{{ analysisDetails?.fileInfo?.pageCount || 1 }} PAGE(S)</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-[3px] border-[#443E73]/5 border-t-emerald-500 rounded-full animate-spin"></div>
          <span class="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Syncing Hardware</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '/services/api'; 

const props = defineProps({
  templateId: { type: String, required: true },
  status: { type: String, default: 'none' }
});

const emit = defineEmits(['updated']);
const localStatus = ref(props.status);
const analysisDetails = ref<any>(null);

onMounted(async () => {
  // Stratégie Zero-Footprint : on check si la data existe déjà en BDD
  if (localStatus.value !== 'complete') {
    await runAnalysis();
  } else {
    await fetchExistingMetadata();
  }
});

/**
 * Lance l'analyse physique du PDF via Gemini / PDF-Lib
 */
const runAnalysis = async () => {
  localStatus.value = 'pending';
  try {
    const response = await api.post('/api/layout', { templateId: props.templateId });
    if (response.data.success) {
      localStatus.value = 'complete';
      analysisDetails.value = response.data.details;
      emit('updated');
    }
  } catch (error) { 
    localStatus.value = 'failed'; 
    console.error("Layout analysis failed:", error);
  }
};

/**
 * Récupère simplement les métadonnées existantes sans relancer l'analyse
 */
const fetchExistingMetadata = async () => {
  try {
    const response = await api.get(`/api/layout/template/${props.templateId}`);
    if (response.data.success) {
      analysisDetails.value = response.data.details;
    }
  } catch (error) { 
    console.error("Could not fetch existing metadata:", error); 
  }
};

/**
 * Calcule la résolution maximale détectée sur les objets raster
 */
const getMaxPpi = () => {
  if (!analysisDetails.value?.images?.length) return 0;
  return Math.max(...analysisDetails.value.images.map((img: any) => img.xPpi || 0));
};

/**
 * Formate les dates PDF (D:YYYYMMDDHHMMSS) en format lisible FR
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return null;
  const clean = dateStr.replace('D:', '').substring(0, 8);
  if (clean.length < 8) return dateStr;
  return `${clean.substring(6,8)}/${clean.substring(4,6)}/${clean.substring(0,4)}`;
};

// Synchronisation bidirectionnelle si le parent change le status
watch(() => props.status, (newVal) => { localStatus.value = newVal; });
</script>