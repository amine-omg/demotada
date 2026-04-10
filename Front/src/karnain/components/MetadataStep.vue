<template>
  <div class="h-full flex flex-col lg:flex-row gap-8 animate-in">
    
    <div class="lg:w-1/3 flex flex-col">
      <div class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        
        <div class="p-6 space-y-4">
          <div class="flex flex-col gap-1">
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Producteur & Créateur</span>
            <span class="text-[11px] font-bold text-[#443E73] truncate">
              {{ analysisDetails?.sourceMetadata?.producer || 'Inconnu' }} 
              <span class="text-gray-300 font-medium">via</span> 
              {{ analysisDetails?.sourceMetadata?.creator || 'Engine' }}
            </span>
          </div>
          
          <div class="h-px bg-gray-50"></div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date de création</span>
              <span class="text-[10px] font-bold text-indigo-600">
                {{ formatRealDate(analysisDetails?.sourceMetadata?.createDate) }}
              </span>
            </div>
            <div>
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Version PDF</span>
              <span class="text-[10px] font-bold text-[#443E73]">v{{ analysisDetails?.fileInfo?.pdfVersion || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="px-6 pb-5 grid grid-cols-2 gap-4">
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Poids du fichier</span>
            <span class="text-[10px] font-bold text-[#443E73]">{{ analysisDetails?.fileInfo?.filesize || '0 KB' }}</span>
          </div>
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Linéarisé (Web)</span>
            <span class="text-[10px] font-bold" :class="analysisDetails?.fileInfo?.isLinearized ? 'text-emerald-500' : 'text-amber-500'">
              {{ analysisDetails?.fileInfo?.isLinearized ? 'Optimisé' : 'Standard' }}
            </span>
          </div>
        </div>

        <div class="bg-gray-50/50 p-6 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Résolution (Max)</span>
            <div class="flex items-center gap-1">
              <span class="text-xs font-black text-emerald-500">{{ getMaxPpi() }}</span>
              <span class="text-[8px] font-bold text-emerald-500/50 uppercase">DPI</span>
            </div>
          </div>
          <div>
            <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Assets & Polices</span>
            <span class="text-xs font-black text-[#443E73]">
              {{ (analysisDetails?.images?.length || 0) + (analysisDetails?.fonts?.length || 0) }} 
              <span class="text-[8px] opacity-40 italic ml-1">obj</span>
            </span>
          </div>
        </div>

        <div class="bg-[#443E73] p-6 shadow-inner mt-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-[8px] font-black text-indigo-200 uppercase tracking-[0.15em]">Empreinte MD5 (Checksum)</span>
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          </div>
          <code class="font-mono text-[9px] text-white/80 break-all leading-tight block select-all">
            {{ analysisDetails?.fileInfo?.checksum || 'En attente...' }}
          </code>
        </div>
      </div>
    </div>

    <div class="lg:w-2/3 flex flex-col h-full">
      <div class="flex items-center justify-between mb-4 pl-2">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span class="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Structure Géométrique Validée</span>
        </div>
      </div>

      <div class="flex-grow bg-[#F8F9FD] rounded-[3rem] border border-gray-100 shadow-inner relative flex items-center justify-center overflow-hidden min-h-[450px]">
        <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: linear-gradient(#443E73 1px, transparent 1px), linear-gradient(90deg, #443E73 1px, transparent 1px); background-size: 40px 40px;"></div>
        
        <div v-if="analysisDetails?.pages?.length" class="relative group scale-95 lg:scale-100 transition-transform">
          <div class="relative w-[240px] h-[339px] bg-white shadow-[0_30px_60px_-15px_rgba(68,62,115,0.2)] rounded-sm border border-gray-200 overflow-hidden">
            <img 
              :src="`http://localhost:3000/uploads/backgrounds/${templateId}_p1.png`" 
              class="absolute inset-0 w-full h-full object-contain opacity-50 z-0 grayscale mix-blend-multiply"
            />
          </div>

          <div class="absolute -right-14 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-black text-[#443E73]/50 tracking-widest">
            {{ analysisDetails.pages[0].height }} mm
          </div>
          <div class="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#443E73]/50 tracking-widest">
            {{ analysisDetails.pages[0].width }} mm
          </div>
        </div>

        <div v-else class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
            <span class="text-[9px] font-black text-gray-300 uppercase tracking-widest">Lecture du fichier...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '/services/api'; 

const props = defineProps({
  templateId: { type: String, required: true }
});

const analysisDetails = ref<any>(null);

onMounted(async () => {
  try {
    // 🔗 On appelle la VRAIE route des métadonnées
    const response = await api.get(`/api/metadata/${props.templateId}`);
    if (response.data) {
      analysisDetails.value = response.data;
    }
  } catch (error) { 
    console.error("Échec de la récupération des métadonnées réelles:", error);
  }
});

/**
 * Extrait le DPI maximum des images embarquées
 */
const getMaxPpi = () => {
  if (!analysisDetails.value?.images?.length) return '---';
  return Math.max(...analysisDetails.value.images.map((img: any) => img.xPpi || 0));
};

/**
 * Formate la date ISO en format lisible FR
 */
const formatRealDate = (dateIso: string) => {
  if (!dateIso) return 'Non spécifié';
  const date = new Date(dateIso);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
</script>