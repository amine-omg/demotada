<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  formationImage: string | null 
  formationTitle: string 
  fileInputRef: HTMLInputElement | null 
  modelValue: string; 
}>()

const emit = defineEmits<{
  (e: 'trigger-file-upload'): void;
  (e: 'handle-image-upload', event: Event): void;
  (e: 'submit-image-url'): void;
  (e: 'update:modelValue', value: string): void;
}>();

const hasImage = computed(() => {
  return props.formationImage && props.formationImage !== '';
});

const triggerFileUpload = () => {
  emit('trigger-file-upload');
};

const handleImageUpload = (event: Event) => {
  emit('handle-image-upload', event);
};

const submitImageUrl = () => {
  emit('submit-image-url');
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">

    <div v-if="!hasImage" class="text-center">
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Ajouter une image de formation</h3>
        <p class="text-gray-600 text-sm mb-4">Une image attrayante aide vos apprenants à identifier votre formation</p>
        <div class="flex flex-col md:flex-row items-center gap-4 w-full">
          <button @click="triggerFileUpload" class="btn-primary flex-1 flex items-center justify-center text-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter une image (local)
          </button>
          <input
            :value="modelValue"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Ou collez l'URL d'une image"
            class="border rounded px-3 py-2 w-full flex-1"
          />
          <button @click="submitImageUrl" class="btn-primary flex-1 flex items-center justify-center text-center">
            Envoyer URL
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Image de la formation</h3>
      <p class="text-gray-600 text-sm mb-4">Cette image sera visible dans la liste des formations et sur la page de présentation</p>

      <div class="w-full max-w-xl h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-6 mx-auto">
        <img :src="formationImage" :alt="formationTitle" class="w-full h-full object-cover" />
      </div>

      <div class="flex flex-wrap justify-center items-center gap-4 w-full max-w-xl mx-auto">
        <button
          @click="triggerFileUpload"
          class="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex-shrink-0 flex items-center justify-center text-center"
          :class="{ 'opacity-50 cursor-not-allowed': hasImage }"
          :disabled="hasImage"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          Parcourir
        </button>

        <div class="flex-grow flex flex-col sm:flex-row items-center gap-4 min-w-[200px]">
          <input
            :value="modelValue"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Modifier l'URL de l'image"
            class="border rounded px-3 py-2 w-full"
          />
          <button @click="submitImageUrl" class="btn-primary flex-shrink-0 flex items-center justify-center text-center">
            Mettre à jour
          </button>
        </div>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      @change="handleImageUpload"
      style="display: none"
    />
  </div>
</template>
