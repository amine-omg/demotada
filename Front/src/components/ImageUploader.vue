<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

const props = defineProps<{
  imageUrl: string | null;
  label: string;
  isUploading?: boolean; // Nouvelle prop pour afficher le chargement
}>();

const emit = defineEmits<{
  (e: 'update:image', file: File): void;
  (e: 'remove:image'): void;
}>();

const isDragging = ref(false);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Affiche l'aperçu local s'il existe, sinon l'image venant de la DB
const displayUrl = computed(() => previewUrl.value || props.imageUrl);

// Nettoyage de la mémoire quand le composant est détruit
onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

const processFile = (file: File) => {
  // Sécurité : Type de fichier
  if (!file.type.startsWith('image/')) {
    alert("Le fichier doit être une image (PNG, JPG, WEBP).");
    return;
  }
  
  // Sécurité : Limite de 10MB (10 * 1024 * 1024 octets)
  if (file.size > 10 * 1024 * 1024) {
    alert("L'image est trop lourde (max 10MB).");
    return;
  }

  // Libère l'ancienne URL de prévisualisation si elle existait
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  
  // Crée l'aperçu visuel immédiat
  previewUrl.value = URL.createObjectURL(file);
  
  // Envoie le fichier au parent (qui appellera le store)
  emit('update:image', file);
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0]);
  }
};

const triggerFileSelect = () => {
  if (props.isUploading) return; // Empêche de cliquer si un upload est en cours
  fileInput.value?.click();
};

const removeImage = () => {
  if (confirm("Supprimer cette image ?")) {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
    emit('remove:image');
  }
};
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-bold text-[#443E73] mb-2">{{ label }}</label>
    
    <div class="relative">
      <div
        v-if="!displayUrl"
        @dragover.prevent="isDragging = true"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileSelect"
        class="flex flex-col justify-center items-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group"
        :class="isDragging 
          ? 'border-[#FE8B7D] bg-rose-50 scale-[1.01]' 
          : 'border-gray-300 bg-gray-50/50 hover:border-[#443E73] hover:bg-white'"
      >
        <div v-if="!isUploading" class="space-y-3 text-center transition-transform duration-300 group-hover:scale-105">
          <div class="mx-auto w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#443E73]">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-700">
              <span class="font-bold text-[#443E73]">Cliquez pour ajouter</span>
            </p>
            <p class="text-xs text-gray-500 mt-1 italic">ou glissez votre fichier ici</p>
          </div>
        </div>

        <div v-else class="flex flex-col items-center space-y-3">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#443E73]"></div>
          <p class="text-sm font-medium text-gray-500">Envoi vers le serveur...</p>
        </div>
      </div>

      <div v-else class="relative w-full h-72 rounded-2xl overflow-hidden group shadow-lg border border-gray-100">
        <img 
          :src="displayUrl" 
          alt="Aperçu" 
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          :class="{ 'opacity-50 blur-sm': isUploading }"
        >
        
        <div v-if="!isUploading" class="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4">
          <button @click="triggerFileSelect" class="px-5 py-2.5 text-sm font-bold bg-white text-[#443E73] rounded-xl hover:bg-[#443E73] hover:text-white transition-all shadow-lg">
            Changer
          </button>
          <button @click="removeImage" class="px-5 py-2.5 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg">
            Supprimer
          </button>
        </div>

        <div v-else class="absolute inset-0 flex items-center justify-center bg-white/20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white shadow-xl"></div>
        </div>
      </div>

      <input ref="fileInput" type="file" @change="handleFileSelect" accept="image/*" class="hidden">
    </div>
    
    <p class="mt-3 text-[11px] text-gray-400 flex items-center">
      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
      PNG, JPG ou WEBP. Taille maximum conseillée : 10MB.
    </p>
  </div>
</template>