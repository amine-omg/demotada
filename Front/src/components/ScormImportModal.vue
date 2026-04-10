<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  showModal: boolean;
  isLoading: boolean; 
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'import-scorm', file: File): void; 
}>();

const selectedFile = ref<File | null>(null);
const fileError = ref<string | null>(null);
const dragOver = ref(false); // Pour le style du drag & drop

watch(() => props.showModal, (newVal) => {
  if (newVal) {
    selectedFile.value = null;
    fileError.value = null;
    dragOver.value = false;
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    validateAndSetFile(target.files[0]);
  }
};

const handleDrop = (event: DragEvent) => {
  dragOver.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    validateAndSetFile(event.dataTransfer.files[0]);
  }
};

const validateAndSetFile = (file: File) => {
  if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
    selectedFile.value = file;
    fileError.value = null;
  } else {
    selectedFile.value = null;
    fileError.value = "Format invalide. Veuillez sélectionner un fichier .zip";
  }
};

const importScorm = () => {
  if (!selectedFile.value) {
    fileError.value = "Veuillez sélectionner un fichier à importer.";
    return;
  }
  if (props.isLoading) return; 
  emit('import-scorm', selectedFile.value);
};

const closeModal = () => {
  if (props.isLoading) return;
  emit('close');
};
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300" @click="closeModal">
    <div class="bg-[#DCD8F4] rounded-lg shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300" @click.stop>
      <h3 class="text-3xl font-bold text-[#423B71] mb-2 text-center">Importer un cours SCORM</h3>
      <p class="text-center text-gray-700 mb-8">Sélectionnez un package SCORM (.zip) à importer.</p>
      
      <form @submit.prevent="importScorm" class="space-y-6">
        <div>
          <label for="scorm-file-upload" class="label">Fichier du package (.zip)</label>
          <div
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
            class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors"
            :class="{ 'border-purple-400 bg-purple-50': dragOver, 'border-gray-300': !dragOver }"
          >
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label for="scorm-file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-[#423B71] hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                  <span>Sélectionnez un fichier</span>
                  <input id="scorm-file-upload" name="scorm-file-upload" type="file" class="sr-only" @change="handleFileChange" accept=".zip,application/zip,application/x-zip-compressed">
                </label>
                <p class="pl-1">ou glissez-déposez</p>
              </div>
              <p class="text-xs text-gray-500">Package SCORM au format .zip</p>
            </div>
          </div>

          <div v-if="selectedFile" class="mt-4 text-sm text-gray-700">
            <strong>Fichier sélectionné :</strong> {{ selectedFile.name }}
          </div>
          <p v-if="fileError" class="text-red-600 text-xs mt-1">{{ fileError }}</p>
        </div>

        <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 pt-4">
          <button type="button" @click="closeModal" :disabled="isLoading" class="w-full sm:w-auto mt-2 sm:mt-0 px-8 py-3 text-base font-bold text-[#423B72] bg-transparent rounded-lg hover:bg-gray-100/50 transition-all disabled:opacity-50">Annuler</button>
          <button type="submit" :disabled="isLoading" class="w-full sm:w-auto px-8 py-3 text-base font-bold rounded-lg shadow-lg transition-all bg-[#B2E9E1] text-[#443E73] hover:bg-[#FF8B7D] disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="!isLoading">Importer le cours</span>
            <span v-else>Importation...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
</style>