<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// Importations des composants de prévisualisation
const TextBlockPreview = defineAsyncComponent(() => import('./previews/TextBlockPreview.vue'));
const ImageBlockPreview = defineAsyncComponent(() => import('./previews/ImageBlockPreview.vue'));
const GoogleDocBlockPreview = defineAsyncComponent(() => import('./previews/GoogleDocBlockPreview.vue'));
const FileBlockPreview = defineAsyncComponent(() => import('./previews/FileBlockPreview.vue'));
const VideoBlockPreview = defineAsyncComponent(() => import('./previews/VideoBlockPreview.vue'));

const props = defineProps<{
  lessonTitle: string;
  lessonBlocks: any[];
}>();

const emit = defineEmits(['add-block', 'edit-block', 'save-block', 'cancel-block', 'update:activeTab']);

const getBlockComponent = (type: string) => {
  switch (type) {
    case 'text': return TextBlockPreview;
    case 'image': return ImageBlockPreview;
    case 'google-docs': return GoogleDocBlockPreview;
    case 'file': return FileBlockPreview;
    case 'video': return VideoBlockPreview;
    default:
      return defineAsyncComponent(async () => ({
        template: `<div class="bg-red-100 p-4 rounded-lg border border-red-300 text-red-700">Type de bloc inconnu: ${type}</div>`
      }));
  }
};
</script>

<template>
  <div class="flex-1 p-8 overflow-y-auto bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-800 mb-12">{{ lessonTitle || 'Titre de la leçon' }}</h1>

      <div v-if="lessonBlocks.length > 0" class="space-y-6 mb-12">
        <div v-for="(block, index) in lessonBlocks" :key="block._id || `block-${index}`">
          <component
            :is="getBlockComponent(block.type)"
            :block="block"
            @edit-block="emit('edit-block', block._id)"
            @save-block="(newData) => emit('save-block', block, newData)"
            @cancel-block="emit('cancel-block', block)"
          />
        </div>
      </div>

      <div 
        class="text-center bg-white rounded-lg border-2 border-dashed border-gray-300 transition-all"
        :class="lessonBlocks.length === 0 ? 'py-16 px-6' : 'py-8 px-6 mt-8'"
      >
        <h3 class="text-lg font-semibold text-gray-700">
          {{ lessonBlocks.length === 0 ? 'Cliquez sur un bloc pour ajouter du contenu' : 'Ajouter un autre élément' }}
        </h3>
        <p v-if="lessonBlocks.length === 0" class="text-sm text-gray-500 mt-1">
          Commencez par ajouter votre premier bloc de contenu à cette leçon.
        </p>
        
        <div class="mt-6 flex justify-center gap-4 flex-wrap">
            <button @click="emit('add-block', 'text')" class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 w-24 transition-colors">
                <i class="fas fa-paragraph text-2xl text-gray-500"></i>
                <span class="mt-2 text-sm font-medium">Texte</span>
            </button>
            
            <button @click="emit('add-block', 'image')" class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 w-24 transition-colors">
                <i class="fas fa-image text-2xl text-gray-500"></i>
                <span class="mt-2 text-sm font-medium">Image</span>
            </button>
            
            <button @click="emit('add-block', 'file')" class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 w-24 transition-colors">
                <i class="fas fa-file-pdf text-2xl text-red-500"></i>
                <span class="mt-2 text-sm font-medium">Fichier</span>
            </button>
            
            <button @click="emit('add-block', 'video')" class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 w-24 transition-colors">
                <i class="fab fa-youtube text-2xl text-red-600"></i>
                <span class="mt-2 text-sm font-medium">YouTube</span>
            </button>
            
            <button @click="emit('add-block', 'google-docs')" class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 w-24 transition-colors">
                <i class="fab fa-google-drive text-2xl text-blue-500"></i>
                <span class="mt-2 text-sm font-medium">Google Docs</span>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>