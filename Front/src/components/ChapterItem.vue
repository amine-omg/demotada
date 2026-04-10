<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import ContentItem from './ContentItem.vue';
import draggable from 'vuedraggable'; 

interface Block {
  _id?: string;
  type: string;
  title: string;
  content: string;
  src: string;
  order: number;
  isDraft: boolean;
  isValidated?: boolean;
  isEditing?: boolean;
}
interface Content {
  _id?: string;
  type: 'lesson' | 'quiz' | 'assignment' | 'task';
  title: string;
  order: number;
  isDraft?: boolean;
  lessonId?: string;
  blocks?: Block[];
  quizRef?: string | { _id: string; title: string; };
}
interface Chapter {
  _id: string;
  title: string;
  description: string;
  contents: Content[];
  isDraft?: boolean;
  order: number;
}

const props = defineProps<{
  chapter: Chapter;
  chapterIndex: number;
}>();

const emit = defineEmits(['edit-chapter', 'open-content-modal']);

const formationBuilderStore = useFormationBuilderStore();

const isEditingTitle = ref(false);
const editedTitle = ref('');
const titleInput = ref<HTMLInputElement | null>(null);

const startEditingTitle = async () => {
  isEditingTitle.value = true;
  editedTitle.value = props.chapter.title;
  await nextTick();
  if (titleInput.value) {
    titleInput.value.focus();
  }
};

const saveTitleEdit = async () => {
  if (!isEditingTitle.value) return;
  const trimmedTitle = editedTitle.value.trim();

  const chapterIdentifier = props.chapter._id;
  if (!chapterIdentifier || trimmedTitle === '' || trimmedTitle === props.chapter.title) {
    isEditingTitle.value = false;
    return;
  }

  try {
    await formationBuilderStore.updateChapter(chapterIdentifier, { title: trimmedTitle });
    isEditingTitle.value = false;
  } catch (error) {
    alert('Erreur lors de la mise à jour du titre du chapitre.');
    console.error('Erreur saveTitleEdit:', error);
  }
};

const editChapter = () => {
  startEditingTitle();
};

const duplicateChapter = () => {
  const chapterIdentifier = props.chapter._id;
  if (!chapterIdentifier) return;

  if (confirm(`Voulez-vous vraiment dupliquer le chapitre "${props.chapter.title}" ?`)) {
    formationBuilderStore.duplicateChapter(chapterIdentifier);
  }
};

const confirmDeleteChapter = () => {
  const chapterIdentifier = props.chapter._id;
  if (!chapterIdentifier) return;

  if (confirm(`Êtes-vous sûr de vouloir supprimer le chapitre "${props.chapter.title}" ? Cette action est irréversible.`)) {
    formationBuilderStore.deleteChapter(chapterIdentifier);
  }
};

const openContentModal = () => {
  const chapterIdentifier = props.chapter._id;
  if (!chapterIdentifier) return;
  emit('open-content-modal', chapterIdentifier);
};

const contents = computed({
  get: () => props.chapter.contents,
  set: (value) => {
    const chapterIndex = formationBuilderStore.formation.chapters.findIndex(c => c._id === props.chapter._id);
    if (chapterIndex !== -1) {
      formationBuilderStore.formation.chapters[chapterIndex].contents = value;
    }
  }
});

const onContentDragEnd = async () => {
  try {
    await formationBuilderStore.updateContentOrder(props.chapter._id, contents.value);
  } catch (error) {
    console.error("La réorganisation du contenu a échoué", error);
    formationBuilderStore.loadFormation(formationBuilderStore.formation._id); 
  }
};
</script>
<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-4 flex flex-wrap items-center justify-between gap-y-3">
      
      <div class="flex items-center w-full">
        <button class="drag-handle text-gray-400 cursor-grab active:cursor-grabbing mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="28" height="28" viewBox="0 0 48 48">
<path d="M39,7H9C8.448,7,8,7.448,8,8v6c0,1.654,1.346,3,3,3h26c1.654,0,3-1.346,3-3V8C40,7.448,39.552,7,39,7z"></path><path d="M39,21H9c-0.552,0-1,0.448-1,1v6c0,1.654,1.346,3,3,3h26c1.654,0,3-1.346,3-3v-6C40,21.448,39.552,21,39,21z"></path><path d="M39,35H9c-0.552,0-1,0.448-1,1v6c0,1.654,1.346,3,3,3h26c1.654,0,3-1.346,3-3v-6C40,35.448,39.552,35,39,35z"></path><path fill="#fff" d="M37,14H11c-1.105,0-2-0.895-2-2V6h30v6C39,13.105,38.105,14,37,14z"></path><path fill="#fff" d="M37,28H11c-1.105,0-2-0.895-2-2v-6h30v6C39,27.105,38.105,28,37,28z"></path><path fill="#fff" d="M37,42H11c-1.105,0-2-0.895-2-2v-6h30v6C39,41.105,38.105,42,37,42z"></path><path d="M37,15H11c-1.654,0-3-1.346-3-3V6c0-0.552,0.448-1,1-1h30c0.552,0,1,0.448,1,1v6C40,13.654,38.654,15,37,15z M10,7v5 c0,0.551,0.449,1,1,1h26c0.551,0,1-0.449,1-1V7H10z"></path><path d="M37,29H11c-1.654,0-3-1.346-3-3v-6c0-0.552,0.448-1,1-1h30c0.552,0,1,0.448,1,1v6C40,27.654,38.654,29,37,29z M10,21v5 c0,0.551,0.449,1,1,1h26c0.551,0,1-0.449,1-1v-5H10z"></path><path d="M37,43H11c-1.654,0-3-1.346-3-3v-6c0-0.552,0.448-1,1-1h30c0.552,0,1,0.448,1,1v6C40,41.654,38.654,43,37,43z M10,35v5  c0,0.551,0.449,1,1,1h26c0.551,0,1-0.449,1-1v-5H10z"></path>
</svg>
        </button>
        <div class="w-12 h-12 bg-[#FE8B7D] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M43,19h-7.343c1.54-5.046,4.702-7.048,4.857-7.143c0.234-0.141,0.401-0.371,0.461-0.638C40.992,11.148,41,11.076,41,11.005 c0.001-0.198-0.001-1.919,0-1.987c0.004-0.202-0.054-0.402-0.168-0.573l-2-3c-0.272-0.408-0.8-0.558-1.246-0.355 c-0.12,0.055-2.969,1.37-5.824,4.484C29.134,12.442,26,17.446,26,25v16c0,1.654,1.346,3,3,3h12c1.654,0,3-1.346,3-3V20 C44,19.447,43.552,19,43,19z"></path><path d="M21,19h-7.343c1.54-5.046,4.702-7.048,4.857-7.143c0.234-0.141,0.401-0.371,0.461-0.638C18.992,11.148,19,11.076,19,11.005 c0.001-0.198-0.001-1.919,0-1.987c0.004-0.202-0.054-0.402-0.168-0.573l-2-3c-0.272-0.408-0.8-0.558-1.246-0.355 c-0.12,0.055-2.969,1.37-5.824,4.484C7.134,12.442,4,17.446,4,25v16c0,1.654,1.346,3,3,3h12c1.654,0,3-1.346,3-3V20 C22,19.447,21.552,19,21,19z"></path><path fill="#fff" d="M29,41h12c1.105,0,2-0.895,2-2V20h-9c1-8,6-11,6-11l-2-3c0,0-11,5-11,19c0,5,0,14,0,14 C27,40.105,27.895,41,29,41z"></path><path d="M41,42H29c-1.654,0-3-1.346-3-3V25c0-7.553,3.134-12.558,5.763-15.426c2.855-3.114,5.704-4.43,5.823-4.484 c0.444-0.204,0.974-0.054,1.246,0.355l2,3c0.151,0.228,0.203,0.507,0.144,0.774c-0.06,0.267-0.227,0.498-0.461,0.638  c-0.175,0.107-4.148,2.609-5.35,9.143H43c0.553,0,1,0.448,1,1v19C44,40.654,42.654,42,41,42z M37.668,7.304 C35.264,8.684,28,13.782,28,25v14c0,0.551,0.448,1,1,1h12c0.552,0,1-0.449,1-1V21h-8c-0.287,0-0.56-0.123-0.75-0.338  c-0.189-0.215-0.278-0.501-0.242-0.786c0.805-6.438,4.061-9.828,5.631-11.116L37.668,7.304z"></path><path fill="#fff" d="M7,41h12c1.105,0,2-0.895,2-2V20h-9c1-8,6-11,6-11l-2-3c0,0-11,5-11,19c0,5,0,14,0,14  C5,40.105,5.895,41,7,41z"></path><path d="M19,42H7c-1.654,0-3-1.346-3-3V25c0-7.553,3.134-12.558,5.763-15.426c2.855-3.114,5.704-4.43,5.823-4.484 c0.445-0.204,0.974-0.054,1.246,0.355l2,3c0.151,0.228,0.203,0.507,0.144,0.774c-0.06,0.267-0.227,0.498-0.461,0.638  c-0.175,0.107-4.148,2.609-5.35,9.143H21c0.553,0,1,0.448,1,1v19C22,40.654,20.654,42,19,42z M15.668,7.304 C13.264,8.684,6,13.782,6,25v14c0,0.551,0.448,1,1,1h12c0.552,0,1-0.449,1-1V21h-8c-0.287,0-0.56-0.123-0.75-0.338  c-0.189-0.215-0.278-0.501-0.242-0.786c0.805-6.438,4.061-9.828,5.631-11.116L15.668,7.304z"></path>
</svg>
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-lg font-medium text-gray-900 leading-tight">
            Chapitre {{ chapterIndex + 1 }}: {{ chapter.title }}
          </span>
          <div class="text-sm text-gray-400">
            ({{ chapter.contents?.length || 0 }} contenu{{ (chapter.contents?.length || 0) !== 1 ? 's' : '' }})
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end space-x-2 w-full">
        <button @click.stop="emit('edit-chapter', chapter._id)" class="action-btn" title="Éditer le titre">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
<path fill-rule="evenodd" d="M5.033,43.753l2.928-11.7 c0.044-0.175,0.135-0.336,0.263-0.464l23.39-23.395c1.599-1.599,4.196-1.599,5.795,0l4.392,4.392c1.601,1.603,1.604,4.2-0.001,5.799 L18.41,41.779c-0.128,0.128-0.289,0.219-0.465,0.263l-11.7,2.924C5.514,45.149,4.85,44.485,5.033,43.753z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M4.999,41.983v2.001h1.001v-2.001 H4.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M41.999,13.538v2.001h1.001v-2.001  H41.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M34.934,44.711l7.767-7.767  c0.193-0.192,0.291-0.444,0.293-0.697l0.001-2.001h-1.577L14.467,7.289c-0.391-0.391-1.024-0.391-1.413,0l-6.455,6.455H4.994  l0.001,2.001C4.99,16.007,5.087,16.27,5.287,16.47l28.233,28.241C33.911,45.102,34.545,45.102,34.934,44.711z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M13.761,5.995  l28.234,28.243l-7.767,7.765L5.994,13.762L13.761,5.995z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M33.521,42.711L5.286,14.47  c-0.391-0.391-0.391-1.024,0-1.415l7.767-7.767c0.391-0.391,1.024-0.391,1.415,0l28.234,28.243c0.391,0.391,0.391,1.024,0,1.415 l-7.767,7.765C34.545,43.102,33.911,43.102,33.521,42.711z M34.229,40.59l6.352-6.352L13.759,7.41l-6.352,6.353L34.229,40.59z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M27.178,27.878 c-0.391-0.391-0.391-1.024,0-1.415l2.832-2.831c0.391-0.391,1.024-0.391,1.415,0c0.391,0.391,0.391,1.024,0,1.415l-2.832,2.831  C28.202,28.269,27.569,28.269,27.178,27.878z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M25.049,22.947 c-0.391-0.391-0.391-1.024,0-1.415l1.429-1.429c0.391-0.391,1.024-0.391,1.415,0c0.391,0.391,0.391,1.024,0,1.415l-1.429,1.429  C26.073,23.338,25.439,23.338,25.049,22.947z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M20.111,20.823 c-0.391-0.391-0.391-1.024,0-1.415l2.832-2.832c0.391-0.391,1.024-0.391,1.415,0c0.391,0.391,0.391,1.024,0,1.415l-2.832,2.832  C21.135,21.214,20.502,21.214,20.111,20.823z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M17.982,15.893 c-0.389-0.391-0.391-1.024,0-1.415l1.429-1.431c0.391-0.389,1.024-0.391,1.415,0c0.389,0.391,0.391,1.024,0,1.415l-1.429,1.431  C19.006,16.282,18.373,16.283,17.982,15.893z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M13.05,13.763  c-0.391-0.391-0.391-1.024,0-1.415l2.832-2.833c0.391-0.391,1.024-0.391,1.415,0c0.391,0.391,0.391,1.024,0,1.415l-2.832,2.833  C14.074,14.154,13.441,14.154,13.05,13.763z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M34.219,34.958  c-0.391-0.391-0.391-1.024,0-1.415l2.832-2.832c0.391-0.391,1.024-0.391,1.415,0c0.391,0.391,0.391,1.024,0,1.415l-2.832,2.832  C35.243,35.349,34.61,35.349,34.219,34.958z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M32.089,30.025  c-0.391-0.391-0.389-1.024,0.001-1.413l1.432-1.429c0.391-0.391,1.024-0.389,1.413,0.001c0.391,0.391,0.389,1.024-0.001,1.413 l-1.432,1.429C33.111,30.417,32.478,30.415,32.089,30.025z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M6.003,41.995 l2.928-11.7l23.39-23.395c1.208-1.208,3.172-1.208,4.38,0l4.392,4.392c1.212,1.212,1.212,3.176,0,4.384l-23.39,23.395L6.003,41.995z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M6.003,41.995l1.756-7.015  l5.259,5.259L6.003,41.995z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M5.033,41.753l2.928-11.7  c0.044-0.175,0.135-0.336,0.263-0.464l23.39-23.395c1.599-1.599,4.196-1.599,5.795,0l4.392,4.392c1.601,1.603,1.604,4.2-0.001,5.799 L18.41,39.779c-0.128,0.128-0.289,0.219-0.465,0.263l-11.7,2.924C5.514,43.149,4.85,42.485,5.033,41.753z M7.378,40.622l9.813-2.453 L40.387,14.97c0.819-0.817,0.821-2.148-0.001-2.969l-4.392-4.392c-0.817-0.817-2.148-0.817-2.965,0L9.834,30.807L7.378,40.622z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M33.806,21.505l-7.312-7.312 c-0.391-0.391-0.391-1.024,0-1.415c0.391-0.391,1.024-0.391,1.415,0l7.312,7.312c0.391,0.391,0.391,1.024,0,1.415 C34.83,21.895,34.197,21.895,33.806,21.505z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M36.73,18.581l-7.312-7.312  c-0.391-0.391-0.391-1.024,0-1.415c0.391-0.391,1.024-0.391,1.415,0l7.312,7.312c0.391,0.391,0.391,1.024,0,1.415 C37.754,18.971,37.121,18.971,36.73,18.581z" clip-rule="evenodd"></path>
</svg>
        </button>
        <button @click.stop="duplicateChapter" class="action-btn" title="Dupliquer le chapitre">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
<path d="M43,31H13v6c0,1.657,1.343,3,3,3h24c1.657,0,3-1.343,3-3V31z"></path><path d="M37,36H7v6c0,1.657,1.343,3,3,3h24c1.657,0,3-1.343,3-3V36z"></path><path fill="#fff" d="M34,42H10c-1.105,0-2-0.895-2-2V8h18l10,10v22C36,41.105,35.105,42,34,42z"></path><path d="M34,43H10c-1.654,0-3-1.346-3-3V8c0-0.552,0.447-1,1-1h18c0.266,0,0.52,0.105,0.707,0.293l10,10 C36.895,17.48,37,17.735,37,18v22C37,41.654,35.654,43,34,43z M9,9v31c0,0.551,0.448,1,1,1h24c0.552,0,1-0.449,1-1V18.414L25.586,9  H9z"></path><polyline fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" points="26,9 26,19 36,19"></polyline><path fill="#fff" d="M40,37H16c-1.105,0-2-0.895-2-2V3h18l10,10v22C42,36.105,41.105,37,40,37z"></path><path d="M40,38H16c-1.654,0-3-1.346-3-3V3c0-0.552,0.447-1,1-1h18c0.266,0,0.52,0.105,0.707,0.293l10,10  C42.895,12.48,43,12.735,43,13v22C43,36.654,41.654,38,40,38z M15,4v31c0,0.551,0.448,1,1,1h24c0.552,0,1-0.449,1-1V13.414L31.586,4 H15z"></path><path d="M42,12h-9V3c0-0.552-0.447-1-1-1s-1,0.448-1,1v10c0,0.552,0.447,1,1,1h10c0.553,0,1-0.448,1-1S42.553,12,42,12z"></path>
</svg>

        </button>
        <button @click.stop="confirmDeleteChapter" class="action-btn" title="Supprimer le chapitre">
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
<path fill-rule="evenodd" d="M6.998,11.997l0.001-1.999  c0-1.656,1.343-3,3-3h28c1.656,0,3,1.344,3,3v1.999c0,0.552-0.449,1-1,1H7.998C7.445,12.997,6.997,12.549,6.998,11.997z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M8.999,40.993l-0.001-2.001h30.001v2  c0,1.657-1.344,3-3,3h-24C10.342,43.991,8.999,42.649,8.999,40.993z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M9.999,38.997v-29h28v29  c0,1.104-0.899,1.997-2.003,1.997h-24C10.893,40.994,9.999,40.101,9.999,38.997z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M8.999,38.997v-29  c0-0.551,0.448-1,1-1h28c0.551,0,1,0.449,1,1v29c0,1.66-1.351,2.997-3.003,2.997h-24C10.339,41.994,8.999,40.654,8.999,38.997z M36.999,38.997v-28h-26v28c0,0.552,0.445,0.997,0.997,0.997h24C36.551,39.994,36.999,39.546,36.999,38.997z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M7.998,9.997  l0.001-1.999c0-1.104,0.896-2,2-2h28c1.104,0,2,0.896,2,2v1.999H7.998z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M6.998,9.997l0.001-1.999  c0-1.656,1.343-3,3-3h28c1.656,0,3,1.344,3,3v1.999c0,0.552-0.449,1-1,1H7.998C7.445,10.997,6.997,10.549,6.998,9.997z M38.999,8.997V7.998c0-0.551-0.449-1-1-1h-28c-0.552,0-1,0.449-1,1.001L8.998,8.997H38.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M17.999,4.997c0-2.207,1.792-4,4-4h4  c2.207,0,4,1.793,4,4c0,0.552-0.449,1-1,1c-0.552,0-1-0.448-1-1c0-1.101-0.899-2-2-2h-4c-1.103,0-2,0.899-2,2c0,0.552-0.449,1-1,1 C18.447,5.997,17.999,5.549,17.999,4.997z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M22.998,34.998v-19  c0-0.551,0.448-1,1-1c0.551,0,1,0.449,1,1v19c0,0.552-0.449,1-1,1C23.446,35.998,22.998,35.55,22.998,34.998z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M14.998,34.998v-19 c0-0.551,0.448-1,1-1c0.551,0,1,0.449,1,1v19c0,0.552-0.449,1-1,1C15.446,35.998,14.998,35.55,14.998,34.998z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M30.997,34.998v-19 c0-0.551,0.448-1,1-1c0.551,0,1,0.449,1,1v19c0,0.552-0.449,1-1,1C31.445,35.998,30.997,35.55,30.997,34.998z" clip-rule="evenodd"></path>
</svg>
        </button>
        <button @click.stop="openContentModal" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span class="hidden sm:inline">Ajouter</span>
        </button>
      </div>
    </div>

    <div class="p-4 border-t border-gray-100">
      <div v-if="!chapter.contents || chapter.contents.length === 0" class="text-gray-500 text-sm py-8 text-center">
        Pas encore de contenu dans ce chapitre.
      </div>
      <draggable
        v-else
        v-model="contents"
        item-key="_id"
        handle=".content-drag-handle"
        @end.stop="onContentDragEnd" 
        class="space-y-3"
      >
        <template #item="{ element: content, index }">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-gray-400 w-6 text-center">{{ index + 1 }}.</span>
            <ContentItem
              class="flex-1"
              :content="content"
              :chapter-id="chapter._id"
            />
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-teal-100 text-teal-700 font-semibold px-4 py-2 rounded-md transition-colors hover:bg-teal-200;
}
.action-btn {
  @apply p-2 rounded-md text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors;
}
</style>