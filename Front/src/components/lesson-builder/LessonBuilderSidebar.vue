<template>
  <aside class="w-80 bg-white shadow-sm flex-shrink-0 flex flex-col transition-all duration-300" :class="{ 'bg-sky-50': highlight }">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex">
        <button @click="$emit('update:activeTab', 'lesson')" :class="{ 'border-[#62D6CA] text-[#62D6CA]': activeTab === 'lesson' }" class="tab-button">Leçon</button>
        <button @click="$emit('update:activeTab', 'blocks')" :class="{ 'border-[#62D6CA] text-[#62D6CA]': activeTab === 'blocks' }" class="tab-button">Blocs</button>
      </nav>
    </div>

    <div v-if="activeTab === 'lesson'" class="flex-1 p-4 overflow-y-auto">
            <h4 class="text-md font-semibold text-gray-800 mb-2">Contenu de la leçon</h4>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
        <input :value="lessonTitle" @input="$emit('update:lessonTitle', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Titre de la leçon">
      </div>



      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Durée estimée (minutes)</label>
        <input :value="dureeEstimee" @input="$emit('update:dureeEstimee', Number(($event.target as HTMLInputElement).value))" type="number" class="input-field" placeholder="Ex: 25">
      </div>

    

      <div class="mb-6">
  <label class="block text-sm font-medium text-gray-700 mb-2">Objectifs Pédagogiques</label>
  <textarea v-model="objectifsAsText" rows="4" class="input-field" placeholder="Un objectif par ligne..."></textarea>
</div>
      
      <div class="space-y-2">
        <div v-for="block in lessonBlocks" :key="block._id || block.order" class="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100">
          <div class="mr-3 text-gray-500 flex-shrink-0">
            <i :class="getBlockDefinition(block.type)?.icon" class="text-lg"></i>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-sm font-medium truncate">{{ block.title || getBlockDefinition(block.type)?.name }}</p>
            <p class="text-xs text-gray-500">{{ getBlockDefinition(block.type)?.name }}</p>
          </div>
          <div class="flex items-center ml-2">
            <button @click="$emit('edit-block', block._id)" class="p-1 text-gray-400 hover:text-gray-600" title="Modifier">
              <i class="fas fa-pen"></i>
            </button>
            <button @click="$emit('delete-block', block._id)" class="p-1 text-red-400 hover:text-red-600" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

  

  <div class="border-t pt-4 mt-4">
    <label class="font-semibold text-sm text-gray-600 mb-1 block">Support PDF principal</label>
    <div v-if="pdfUrl" class="text-xs text-green-600 truncate my-2">
      Fichier actuel : {{ pdfUrl.split('/').pop() }}
    </div>
    <input
      v-model="internalPdfUrl"
      @change="emit('update:pdf-url', internalPdfUrl)"
      type="text"
      class="w-full p-2 border rounded-md text-sm"
      placeholder="Collez une URL ou uploadez un fichier"
    />
    <button @click="triggerPdfUpload" class="btn-secondary w-full mt-2 text-sm">
      Uploader un PDF...
    </button>
    <input type="file" ref="pdfInput" @change="handlePdfUpload" class="hidden" accept="application/pdf" />
  </div>



      <button @click="$emit('update:activeTab', 'blocks')" class="btn-secondary w-full mt-6">+ Ajouter un bloc</button>
      <button @click="$emit('save-lesson')" class="btn-primary w-full mt-4">Sauvegarder la leçon</button>
    </div>

    <div v-if="activeTab === 'blocks'" class="flex-1 p-4 overflow-y-auto">
      <div class="grid grid-cols-2 gap-3">
        <button v-for="block in blockTypes" :key="block.type" @click="$emit('open-block-modal', block.type)" class="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300">
          <div class="w-10 h-10 mb-2 flex items-center justify-center">
              <i :class="block.icon" class="text-2xl" :style="{ color: block.color }"></i>
          </div>
          <span class="text-xs font-medium text-gray-900 text-center">{{ block.name }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'; 
import { useFormationBuilderStore } from '../../stores/formationBuilder';

const props = defineProps<{
  activeTab: string;
  lessonTitle: string;
  dureeEstimee: number;
  objectifs: string[];
  lessonBlocks: any[];
  pdfUrl: string; 
  highlight: boolean;
  notesPedagogiques: string; 
}>();

const emit = defineEmits([
    'update:activeTab', 
    'update:lessonTitle', 
    'update:dureeEstimee',
    'update:objectifs', 
    'edit-block', 
    'delete-block', 
    'update:pdfUrl',
    'open-block-modal', 
    'update:notesPedagogiques',
    'save-lesson'
]);

const formationBuilderStore = useFormationBuilderStore();
const pdfInput = ref<HTMLInputElement | null>(null);
const internalPdfUrl = ref(props.pdfUrl);

const objectifsAsText = computed({
  get: () => props.objectifs.join('\n'),
  set: (value) => {
    emit('update:objectifs', value.split('\n'));
  }
});

const blockTypes = ref([
    { type: 'text', name: 'Texte', icon: 'fas fa-paragraph', color: '#3B82F6' },
    { type: 'image', name: 'Image', icon: 'fas fa-image', color: '#10B981' },
    { type: 'video', name: 'Vidéo (URL)', icon: 'fab fa-youtube', color: '#EF4444' },
    { type: 'file', name: 'Fichier/Support', icon: 'fas fa-paperclip', color: '#6B7280' },
    { type: 'exercice', name: 'Exercice', icon: 'fas fa-pencil-ruler', color: '#8B5CF6' },
]);

const getBlockDefinition = (type: string) => {
  return blockTypes.find(b => b.type === type);
};

const triggerPdfUpload = () => {
  pdfInput.value?.click();
};

const handlePdfUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  
  const file = target.files[0];
  try {
    const newUrl = await formationBuilderStore.uploadLessonFile(file);
    internalPdfUrl.value = newUrl;
    emit('update:pdf-url', newUrl);
    alert('PDF uploadé avec succès !');
  } catch (error) {
    // ▼▼▼ ON AJOUTE CETTE LIGNE CRUCIALE ▼▼▼
    console.error("L'upload a échoué, voici l'erreur détaillée:", error);
    alert("L'upload a échoué. Vérifiez la console (F12) pour les détails.");
  }
};
</script>

<style scoped>
.tab-button {
  @apply py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap w-1/2 text-center text-gray-500 border-transparent hover:border-gray-300;
}
.btn-primary {
  @apply bg-[#B0E9DF] text-black font-medium px-6 py-3 rounded transition-all duration-200 shadow-sm hover:shadow-md;
}
.btn-secondary {
    @apply bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded transition-all duration-200 hover:bg-gray-200;
}
.input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 focus:ring-[#FF8B7D] focus:border-[#FF8B7D];
}
</style>
