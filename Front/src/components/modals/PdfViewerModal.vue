<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import api from '/services/api';
import CreateIncidentModal from './CreateIncidentModal.vue';

const props = defineProps<{
  show: boolean;
  pdfUrl: string | null;
  contentId?: string;
  sessionId?: string;
  moduleId?: string;
  chapterId?: string;
  formationId?: string;
}>();

const emit = defineEmits(['close', 'on-complete']);

const page = ref(1);
const pageCount = ref(1);
const isLoading = ref(true);
const rotation = ref(0); 
const isFullscreen = ref(false); 

const isIncidentModalOpen = ref(false);

const isLastPage = computed(() => {
  return !isLoading.value && page.value === pageCount.value;
});

watch(() => props.pdfUrl, (newUrl) => {
  if (newUrl) {
    page.value = 1;
    rotation.value = 0;
    isFullscreen.value = false;
    isLoading.value = true;
  }
});

function rotateRight() {
  rotation.value = (rotation.value + 90) % 360;
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

function handleDocumentLoaded(pdfProxy: any) {
  isLoading.value = false;
  pageCount.value = pdfProxy.numPages;
}

function handleLoadingError(error: any) {
  console.error("Erreur de chargement du PDF:", error);
  isLoading.value = false;
}

const prevPage = () => { if (page.value > 1) page.value--; };
const nextPage = () => { if (page.value < pageCount.value) page.value++; };
const completeLesson = () => emit('on-complete');

const handleIncidentSubmit = async (payload: any) => {
  try {
    const incidentData = {
      ...payload,
      // On lie directement l'incident à la formation et la session si disponibles
      sessionId: props.sessionId,
      formationId: props.formationId,
      contexte: {
        typeSupport: 'PDF',
        pdfUrl: props.pdfUrl,
        activite: props.contentId, // Identifié comme 'activite' pour le populate backend
        module: props.moduleId,
        chapitre: props.chapterId
      }
    };
    await api.post('/api/incidents', incidentData);
    isIncidentModalOpen.value = false;
    alert("Votre message a été transmis à l'équipe pédagogique.");
  } catch (error) {
    console.error("Erreur incident:", error);
  }
};
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 backdrop-blur-md bg-gray-900/60 transition-all duration-300"
    @click.self="emit('close')"
  >
    <div 
      :class="[
        'bg-[#f8f9fa] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-500 ease-in-out relative overflow-hidden',
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh] rounded-[2.5rem]'
      ]"
    >
      <div class="bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-[#EFEAFB] rounded-2xl flex items-center justify-center text-[#8A79E2] shadow-sm">
            <i class="fas fa-file-pdf text-xl"></i>
          </div>
          <div class="hidden xs:block">
            <h3 class="text-lg md:text-xl font-black text-[#423B71] tracking-tighter leading-tight">Visionneuse de cours</h3>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PDF Interactif</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button @click="isIncidentModalOpen = true" class="help-btn">
            <i class="fas fa-life-ring"></i>
            <span class="hidden sm:inline">Aide</span>
          </button>
          <div class="w-px h-8 bg-gray-100 mx-1"></div>
          <button @click="rotateRight" class="tool-btn"><i class="fas fa-redo"></i></button>
          <button @click="toggleFullscreen" class="tool-btn">
            <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
          <button @click="emit('close')" class="close-btn"><i class="fas fa-times"></i></button>
        </div>
      </div>

      <div 
        class="flex-1 overflow-auto relative flex items-start justify-center transition-all scrollbar-thin"
        :class="[isFullscreen ? 'bg-gray-900 p-0' : 'bg-gray-100/50 p-4 md:p-10']"
      >
        <div v-if="isLoading" class="absolute inset-0 flex flex-col gap-4 items-center justify-center z-20 bg-gray-50/80 backdrop-blur-sm">
          <i class="fas fa-circle-notch fa-spin text-4xl text-[#8A79E2]"></i>
          <p class="font-black text-[#423B71] uppercase tracking-widest text-xs">Chargement...</p>
        </div>

        <div 
          class="transition-all duration-500 ease-out origin-top shadow-2xl"
          :class="[isFullscreen ? 'w-full md:w-[85vw]' : 'w-full max-w-4xl']"
          :style="{ transform: `rotate(${rotation}deg)` }"
        >
          <VuePdfEmbed
            v-if="pdfUrl"
            :key="pdfUrl + isFullscreen"
            :source="pdfUrl"
            :page="page"
            class="pdf-render"
            @loaded="handleDocumentLoaded"
            @error="handleLoadingError"
          />
        </div>
      </div>

      <div class="bg-white p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0 z-10">
        <div class="w-full sm:w-1/3 flex justify-start">
            <button v-if="isLastPage" @click="completeLesson" class="complete-btn">
                <i class="fas fa-check-circle mr-2"></i> Terminer
            </button>
            <div v-else class="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              {{ page }} / {{ pageCount }} pages
            </div>
        </div>
        
        <div class="flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button @click="prevPage" :disabled="page <= 1" class="nav-btn"><i class="fas fa-chevron-left"></i></button>
            <div class="px-6 py-2 text-xs font-black text-[#423B71] min-w-[100px] text-center uppercase tracking-tighter">
              Page {{ page }}
            </div>
            <button @click="nextPage" :disabled="page >= pageCount" class="nav-btn"><i class="fas fa-chevron-right"></i></button>
        </div>

        <div class="hidden sm:flex w-1/3 justify-end items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
          <i class="fas fa-expand-arrows-alt"></i>
          Mode {{ isFullscreen ? 'Plein écran' : 'Standard' }}
        </div>
      </div>
    </div>

    <CreateIncidentModal :showModal="isIncidentModalOpen" @close="isIncidentModalOpen = false" @submit="handleIncidentSubmit" />
  </div>
</template>

<style scoped>
/* CORRECTION : On retire le width:auto qui bloquait l'expansion */
.pdf-render :deep(.vue-pdf-embed > div) {
  width: 100% !important; 
  background-color: white;
  margin: 0 auto !important;
}

:deep(canvas) {
  width: 100% !important;
  height: auto !important;
  display: block;
}

.help-btn {
  @apply flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#8A79E2] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#EFEAFB] transition-all;
}

.tool-btn {
  @apply w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#8A79E2] hover:border-[#8A79E2] transition-all;
}

.close-btn {
  @apply w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all ml-1;
}

.nav-btn {
  @apply w-9 h-9 flex items-center justify-center bg-white text-[#423B71] rounded-xl shadow-sm disabled:opacity-20 transition-all;
}

.complete-btn {
  @apply bg-[#B2E9E1] text-[#423B71] font-black text-[10px] uppercase tracking-widest py-2.5 px-6 rounded-xl hover:bg-[#FF8B7D] hover:text-white transition-all shadow-sm;
}

.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thin::-webkit-scrollbar-thumb { @apply bg-gray-300 rounded-full; }
</style>