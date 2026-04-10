<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// On importe dynamiquement les composants du sous-dossier /previews/
const TextBlockPreview = defineAsyncComponent(() => import('./previews/TextBlockPreview.vue'));
const ImageBlockPreview = defineAsyncComponent(() => import('./previews/ImageBlockPreview.vue'));
const FileBlockPreview = defineAsyncComponent(() => import('./previews/FileBlockPreview.vue'));
const VideoBlockPreview = defineAsyncComponent(() => import('./previews/VideoBlockPreview.vue'));

const props = defineProps<{
  lessonTitle: string;
  lessonBlocks: any[];
}>();

const emit = defineEmits(['add-block', 'edit-block', 'save-block', 'cancel-block']);

const getBlockComponent = (type: string) => {
  switch (type) {
    case 'text': return TextBlockPreview;
    case 'image': return ImageBlockPreview;
    case 'file': return FileBlockPreview;
    case 'video': return VideoBlockPreview;
    default: return null; 
  }
};
</script>

<template>
  <div class="flex-1 p-8 overflow-y-auto bg-white">
    <div class="max-w-5xl mx-auto">
      
      <h1 class="text-5xl font-extrabold text-gray-900 mb-16 tracking-tight leading-tight">
        {{ lessonTitle || 'Titre de la leçon' }}
      </h1>

      <div v-if="lessonBlocks.length > 0" class="space-y-12">
        <div v-for="(block, index) in lessonBlocks" :key="block._id || `block-${index}`" class="w-full">
          <component
            :is="getBlockComponent(block.type)"
            :block="block"
            @edit-block="emit('edit-block', block._id)"
            @save-block="(newData) => emit('save-block', block, newData)"
            @cancel-block="emit('cancel-block', block)"
          />
        </div>
      </div>

      <div class="my-12">
        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-dashed border-gray-300"></div>
          </div>
          <div class="relative flex justify-center">
            <button
              @click="emit('add-block', 'text')"
              class="bg-white border border-gray-200 shadow-sm p-2 rounded-full text-gray-400 hover:text-purple-600 hover:border-purple-300 transition-all transform hover:scale-110"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="lessonBlocks.length === 0" class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <h3 class="text-xl font-bold text-gray-800">Votre leçon est vide</h3>
        <p class="text-gray-500 mt-2 mb-8">Ajoutez du contenu pour commencer.</p>
        <div class="flex justify-center gap-6">
          <button @click="emit('add-block', 'text')" class="flex flex-col items-center group">
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all border border-gray-100">
              <i class="fas fa-paragraph text-xl text-gray-400"></i>
            </div>
            <span class="mt-2 text-xs font-bold text-gray-500">Texte</span>
          </button>
          <button @click="emit('add-block', 'image')" class="flex flex-col items-center group">
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all border border-gray-100">
              <i class="fas fa-image text-xl text-gray-400"></i>
            </div>
            <span class="mt-2 text-xs font-bold text-gray-500">Image</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>