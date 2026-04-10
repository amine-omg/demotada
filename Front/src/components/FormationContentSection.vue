<script setup lang="ts">
import { computed } from 'vue';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import draggable from 'vuedraggable'; 

import ChapterItem from './ChapterItem.vue';

const formationBuilderStore = useFormationBuilderStore();

const chapters = computed({
  get: () => formationBuilderStore.formation.chapters,
  set: (value) => formationBuilderStore.setChapters(value), 
});

const emit = defineEmits([
  'add-chapter',
  'edit-chapter',
  'open-content-modal'
]);

const onChapterDragEnd = async () => {
  const orderedIds = chapters.value.map(chapter => chapter._id);

  try {
    await formationBuilderStore.updateChapterOrder(orderedIds);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre des chapitres", error);
    alert("Une erreur est survenue lors de la réorganisation.");
    formationBuilderStore.loadFormation(formationBuilderStore.formation._id);
  }
};

const handleOpenChapterModal = () => {
  emit('add-chapter');
};


const handleEditChapter = (chapterId: string) => {
  emit('edit-chapter', chapterId);
};

const handleOpenContentModal = (chapterId: string) => {
  emit('open-content-modal', chapterId);
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <div class="lg:col-span-2 space-y-6">
      <div v-if="chapters && chapters.length > 0">
        
        <draggable
          v-model="chapters"
          item-key="_id"
          handle=".drag-handle"
          @end="onChapterDragEnd"
          class="space-y-6"
        >
          <template #item="{ element: chapter, index: chapterIndex }">
            <ChapterItem
              :chapter="chapter"
              :chapterIndex="chapterIndex"
              @edit-chapter="handleEditChapter"
              @open-content-modal="handleOpenContentModal"
            />
          </template>
        </draggable>

        <button @click="handleOpenChapterModal" class="btn-primary mt-6">
          Ajouter un autre chapitre
        </button>
      </div>

      <div v-else class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm border py-16 px-6 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path fill-rule="evenodd" d="M40.998,13.999v2.001h1.999v-2.001  H40.998z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M15.035,36.725l2-7  c0.047-0.163,0.135-0.312,0.255-0.432l19-19c0.391-0.391,1.024-0.391,1.415,0l5,5c0.391,0.391,0.391,1.024,0,1.415l-19,19 c-0.12,0.12-0.269,0.208-0.432,0.255l-7,2C15.519,38.177,14.821,37.478,15.035,36.725z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M30.723,35.962l-0.097-0.033  l-4.969-1.987l-0.503-0.159c-0.593-0.207-1.241-0.503-1.795-0.951c-0.78-0.629-1.361-1.556-1.361-2.833 c0-1.204,0.6-2.027,1.397-2.497l-0.861,0.357l-1.587,1.409c-0.531,0.453-1.212,0.724-1.953,0.724c-1.656,0-3-1.345-3-3.001  c0-0.808,0.321-1.544,0.845-2.084l6.443-6.605c1.411-1.445,3.661-2.535,5.825-2.296l9,1c0.195,0.021,0.38,0.1,0.531,0.225l6,5 c0.228,0.191,0.36,0.472,0.36,0.768v13c0,0.552-0.449,1-1,1h-6C35.543,36.999,33.071,36.633,30.723,35.962z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M4.999,41.001l-0.001-2.001h32.001v2  c0,1.657-1.344,3-3,3h-26C6.342,43.999,4.999,42.657,4.999,41.001z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M5.999,38.999 L5.998,5.001h30.001v33.999c0,1.104-0.896,2-2,2h-26C6.895,40.999,5.999,40.103,5.999,38.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M4.999,39.001L4.998,5.002 c-0.001-0.552,0.448-1.001,1-1.001h30.001c0.551,0,1,0.449,1,1v33.999c0,1.657-1.344,3-3,3h-26 C6.342,41.999,4.999,40.657,4.999,39.001z M34.999,38.999V6.001H6.998l0.001,32.999c0,0.552,0.448,1,1,1h26 C34.55,39.999,34.999,39.551,34.999,38.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M13.997,6.999l0.001-1 c0-0.552,0.449-1,1-0.999c0.552,0,1,0.449,0.999,1v1c0,0.551,0.449,1,1.001,1h8.005c0.551,0,1.001-0.449,1.001-1l-0.001-1 c-0.001-0.551,0.447-1,0.999-1c0.551-0.001,1,0.447,1,0.999l0.003,1c0,1.657-1.345,3.001-3.001,3.001h-8.005  C15.341,10.001,13.997,8.657,13.997,6.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M9.998,35.001c0-0.551,0.448-1,1-1h1  c0.551,0,1,0.449,1,1c0,0.552-0.449,1-1,1h-1C10.446,36.001,9.998,35.553,9.998,35.001z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M28.998,21.001v6.999h7.999v-6.999 H28.998z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M38.001,33.999  l-4.051-2.611l-1.949-4.389c0.996-1.192,2.26-2.231,4-3c-0.92-1.205-1.579-2.544-2.003-4l-12,5l-1.704,1.515  c-0.349,0.299-0.803,0.479-1.297,0.479c-1.103,0-2-0.897-2-2.001c0-0.539,0.213-1.028,0.563-1.388l6.441-6.604  c1.253-1.284,3.216-2.197,5-2l9,1l6,5v13H38.001z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M37.001,33.999c0-0.551,0.448-1,1-1h5 V21.469l-5.409-4.508l-8.701-0.967c-1.404-0.156-3.079,0.581-4.175,1.704l-6.44,6.603c-0.175,0.18-0.279,0.423-0.279,0.691  c0,0.553,0.449,1.001,1,1.001c0.247,0,0.472-0.088,0.64-0.232l1.696-1.508c0.083-0.073,0.177-0.133,0.28-0.176l12-5 c0.551-0.229,1.179,0.072,1.345,0.644c0.391,1.344,0.996,2.571,1.837,3.672c0.392,0.515,0.2,1.261-0.391,1.521  c-1.589,0.703-2.732,1.644-3.637,2.727c-0.353,0.424-0.985,0.48-1.408,0.127c-0.424-0.353-0.48-0.985-0.127-1.408 c0.815-0.976,1.797-1.859,3.036-2.592l0.251-0.151c-0.44-0.707-0.799-1.429-1.092-2.183l-0.033-0.099l-10.857,4.524l-1.587,1.409  c-0.531,0.453-1.212,0.724-1.953,0.724c-1.656,0-3-1.345-3-3.001c0-0.808,0.321-1.544,0.845-2.084l6.443-6.605  c1.411-1.445,3.661-2.535,5.825-2.296l9,1c0.195,0.021,0.38,0.1,0.531,0.225l6,5c0.228,0.191,0.36,0.472,0.36,0.768v13  c0,0.552-0.449,1-1,1h-6C37.449,34.999,37.001,34.551,37.001,33.999z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M17.998,27.999l-2,7l7-2 l19-19l-5-5L17.998,27.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M15.035,34.725l2-7  c0.047-0.163,0.135-0.312,0.255-0.432l19-19c0.391-0.391,1.024-0.391,1.415,0l5,5c0.391,0.391,0.391,1.024,0,1.415l-19,19 c-0.12,0.12-0.269,0.208-0.432,0.255l-7,2C15.519,36.177,14.821,35.478,15.035,34.725z M17.454,33.543l5.02-1.433l18.109-18.111 l-3.585-3.585l-18.11,18.109L17.454,33.543z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M38.001,33.999  c-2.356,0-4.735-0.353-7-1l-5-2c-1.359-0.388-3-1.132-3-3c0-1.763,1.808-2.148,3-2l6,1L38.001,33.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M30.726,33.962l-0.097-0.033 l-4.969-1.987l-0.503-0.159c-0.593-0.207-1.241-0.503-1.795-0.951c-0.78-0.629-1.361-1.556-1.361-2.833 c0-1.308,0.708-2.165,1.608-2.612c0.825-0.409,1.787-0.471,2.535-0.377l6.021,1.004c0.544,0.091,0.912,0.605,0.821,1.151  c-0.091,0.544-0.605,0.912-1.151,0.821l-5.979-0.996c-0.444-0.055-0.983,0.003-1.359,0.189c-0.305,0.151-0.497,0.364-0.497,0.82 c0,0.589,0.236,0.969,0.617,1.277c0.423,0.34,1.016,0.579,1.656,0.761l0.097,0.033l4.944,1.979l0.781,0.209 c1.931,0.481,3.927,0.74,5.904,0.74c0.551,0,1,0.449,1,1c0,0.552-0.449,1-1,1C35.546,34.999,33.074,34.633,30.726,33.962z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M36.73,18.147l-3.88-3.88 c-0.391-0.391-0.391-1.024,0-1.415c0.391-0.391,1.024-0.391,1.415,0l3.88,3.88c0.391,0.391,0.391,1.024,0,1.415 C37.754,18.538,37.121,18.538,36.73,18.147z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M17.998,27.999l-2,7l7-2 L17.998,27.999z" clip-rule="evenodd"></path>
</svg>
            </div>
          </div>
          <h5 class="text-lg font-poppins text-gray-900 mb-2">Commencez à construire votre formation</h5>
          <p class="text-gray-600 text-sm mb-4">
            Structurez votre parcours en créant des chapitres. Chaque chapitre pourra contenir des leçons et des quiz.
          </p>
          <button @click="handleOpenChapterModal" class="btn-primary">
            Créer le premier chapitre
          </button>
        </div>
      </div>
    </div>

    
  </div>
</template>