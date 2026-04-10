<template>
  <div 
    class="w-full border-2 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group relative overflow-hidden"
    :class="[
      isDragging 
        ? 'border-[#050505] bg-slate-50 scale-[1.01] shadow-inner' 
        : 'border-[#E5E5D1] bg-white hover:border-[#050505] hover:bg-[#FDFCFB] hover:shadow-sm'
    ]"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="triggerFileInput"
  >
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept=".pdf" 
      @change="onFileChange" 
    />

    <div 
      class="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 border shadow-sm"
      :class="[
        isDragging 
          ? 'bg-[#050505] border-[#050505] text-[#E5E5D1]' 
          : 'bg-white border-[#E5E5D1] text-[#050505] group-hover:bg-[#050505] group-hover:text-[#E5E5D1]'
      ]"
    >
      <svg class="w-8 h-8 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>

    <h3 class="text-2xl font-black text-[#050505] mb-3 uppercase tracking-tighter italic transition-colors group-hover:text-black">
      Déposer le document
    </h3>
    <p class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
      Cliquez pour parcourir ou glissez le fichier
    </p>

    <div v-if="isUploading" class="absolute inset-0 bg-white/90 rounded-[2rem] flex flex-col items-center justify-center backdrop-blur-md z-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#E5E5D1] border-t-[#050505] mb-6"></div>
      <p class="text-[#050505] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
        Initialisation du moteur...
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// On définit les événements que ce composant peut envoyer à son parent
const emit = defineEmits(['file-selected']);

// Props (optionnel) pour savoir si le parent est déjà en train de traiter un fichier
defineProps({
  isUploading: {
    type: Boolean,
    default: false
  }
});

// État local
const isDragging = ref(false);
const fileInput = ref(null);

// Gestion du Drag & Drop
const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    validateAndEmit(files[0]);
  }
};

// Gestion du Clic classique
const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    validateAndEmit(files[0]);
  }
  // On reset l'input pour pouvoir ré-uploader le même fichier si besoin
  event.target.value = ''; 
};

// Validation du fichier
const validateAndEmit = (file) => {
  if (file.type !== 'application/pdf') {
    alert('Karnain n\'accepte que les fichiers PDF pour le moment.');
    return;
  }
  
  // Si c'est bien un PDF, on l'envoie au parent (PdfAnalyzerPage.vue)
  emit('file-selected', file);
};
</script>