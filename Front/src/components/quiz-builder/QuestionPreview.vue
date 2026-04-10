<script setup lang="ts">
import { computed } from 'vue';

interface Option {
    _id?: string;
    text: string;
    isCorrect: boolean;
}
interface ImageOption {
    _id?: string;
    imageUrl: string;
    isCorrect: boolean;
}
interface OrderingElement {
    _id?: string;
    text: string;
    order: number;
}
interface BlankOption {
    _id?: string;
    text: string;
}

interface Question {
    _id?: string;
    text: string; 
    type: 'single-choice' | 'multiple-choice' | 'true-false' | 'image-qcm' | 'ordering' | 'fill-in-the-blanks';
    points: number;
    imageUrl?: string; 
    explanationPdfUrl?: string;
    options?: Option[]; 
    explanation?: string;
    imageOptions?: ImageOption[]; 
    orderingElements?: OrderingElement[]; 
    blankOptions?: BlankOption[]; 
    blankTextContent?: string; 
}

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits(['edit-question', 'delete-question']);

const getQuestionTypeLabel = computed(() => {
    switch (props.question.type) {
        case 'single-choice': return 'QCM (Choix Unique)';
        case 'multiple-choice': return 'Choix Multiples';
        case 'true-false': return 'Vrai ou Faux';
        case 'image-qcm': return 'QCM Image';
        case 'ordering': return 'Mettre dans l\'ordre';
        case 'fill-in-the-blanks': return 'Texte à Trous';
        default: return 'Type de question inconnu';
    }
});

const getQuestionTypeIcon = computed(() => {
    switch (props.question.type) {
        case 'single-choice': return 'fas fa-check-circle text-blue-500';
        case 'multiple-choice': return 'fas fa-tasks text-green-500';
        case 'true-false': return 'fas fa-yin-yang text-purple-500';
        case 'image-qcm': return 'fas fa-images text-yellow-600';
        case 'ordering': return 'fas fa-sort-numeric-down text-indigo-600';
        case 'fill-in-the-blanks': return 'fas fa-file-alt text-teal-600';
        default: return 'fas fa-question-circle text-gray-500';
    }
});

const getOptionTextColorClass = (isCorrect: boolean) => {
    return isCorrect ? 'text-green-700 font-medium' : 'text-gray-600';
};

const getOptionIconClass = (isCorrect: boolean) => {
    return isCorrect ? 'fas fa-check-circle text-green-500' : 'far fa-circle text-gray-400';
};

const handleEditClick = () => {
  // 1. On émet l'ID pour le parent
  console.log("Émission de la modification pour ID:", props.question._id);
  emit('edit-question', props.question._id);
  
  // 2. Scroll vers le haut via le document (plus robuste que window.scrollTo)
  try {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } catch (err) {
    // Solution de secours si smooth n'est pas supporté
    document.documentElement.scrollTop = 0;
  }
};
</script>

<template>
    <div class="border p-4 rounded-lg bg-gray-50 hover:bg-white transition-colors cursor-pointer flex flex-col space-y-3">
        <div class="flex items-center justify-between">
            <h4 class="font-semibold text-lg text-gray-800 flex items-center">
                <i :class="getQuestionTypeIcon" class="mr-2 text-base"></i>
                {{ getQuestionTypeLabel }}
               
             <span v-if="question.points" class="ml-4 text-sm font-bold px-3 py-1 rounded-full text-green-800 bg-green-200">
                    {{ question.points }} Pts
                </span>
            </h4>
            <div class="flex space-x-2">
               
               <button 
        @click.stop="handleEditClick" 
        class="text-blue-500 hover:text-blue-700 p-1"
        title="Modifier"
      >
  <i class="fas fa-edit"></i>
</button>
                <button @click.stop="emit('delete-question', question._id)" class="text-red-500 hover:text-red-700" title="Supprimer la question">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>

<p v-if="question.text" class="text-gray-700 mb-2 whitespace-pre-wrap">{{ question.text }}</p>
<p v-else class="text-gray-500 italic mb-2">Pas de texte principal défini.</p>

<div v-if="question.imageUrl" class="mb-4">
    <a :href="question.imageUrl" target="_blank" class="inline-block group relative">
        <img 
            :src="question.imageUrl" 
            alt="Illustration de la question" 
            class="h-28 w-auto rounded-lg border border-gray-200 shadow-sm transition-all hover:ring-2 hover:ring-indigo-400 cursor-zoom-in"
        />
        <div class="hidden group-hover:block absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-white text-center rounded-b-lg">
            Agrandir
        </div>
    </a>
</div>


        <div class="space-y-1 text-sm">
            <div v-if="question.options && question.options.length > 0">
                <p class="font-semibold text-gray-700">Options :</p>
                <div
                    v-for="option in question.options"
                    :key="option._id || option.text"
                    class="flex items-start"
                    :class="getOptionTextColorClass(option.isCorrect)"
                >
                    <i :class="getOptionIconClass(option.isCorrect)" class="mr-2 mt-1"></i>
                    <span>{{ option.text }}</span>
                </div>
            </div>

            <div v-if="question.type === 'image-qcm' && question.imageOptions && question.imageOptions.length > 0">
                <p class="font-semibold text-gray-700">Images :</p>
                <div class="grid grid-cols-3 gap-2">
                    <div v-for="imgOption in question.imageOptions" :key="imgOption._id || imgOption.imageUrl" class="relative">
                        <img :src="imgOption.imageUrl" alt="Option Image" class="w-full h-auto rounded-md border" :class="{ 'border-green-500 ring-2 ring-green-500': imgOption.isCorrect }">
                        <i v-if="imgOption.isCorrect" class="fas fa-check-circle absolute top-1 right-1 text-green-500 bg-white rounded-full"></i>
                    </div>
                </div>
            </div>

            <div v-if="question.type === 'ordering' && question.orderingElements && question.orderingElements.length > 0">
                <p class="font-semibold text-gray-700">Ordre correct :</p>
                <ol class="list-decimal list-inside space-y-1">
                    <li v-for="(element, index) in question.orderingElements.sort((a, b) => a.order - b.order)" :key="element._id || index" class="text-gray-700">
                        {{ element.text }}
                    </li>
                </ol>
            </div>

            <div v-if="question.type === 'fill-in-the-blanks'">
                <p class="font-semibold text-gray-700">Texte à compléter :</p>
                <p class="bg-gray-100 p-3 rounded-md italic text-gray-800 break-words whitespace-pre-wrap">{{ question.blankTextContent || 'Pas de texte défini.' }}</p>
                <p v-if="question.blankOptions && question.blankOptions.length > 0" class="font-semibold text-gray-700 mt-2">Mots disponibles :</p>
                <div v-if="question.blankOptions && question.blankOptions.length > 0" class="flex flex-wrap gap-2 mt-1">
                    <span v-for="(blank, index) in question.blankOptions" :key="blank._id || index" class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                        {{ blank.text }}
                    </span>
                </div>
            </div>

            <p v-if="
                (!question.options || question.options.length === 0) &&
                (!question.imageOptions || question.imageOptions.length === 0) &&
                (!question.orderingElements || question.orderingElements.length === 0) &&
                (!question.blankOptions || question.blankOptions.length === 0) &&
                question.type !== 'fill-in-the-blanks' 
            " class="text-gray-500 italic mt-4">
                Aucune option/élément défini pour cette question.
            </p>
        </div>
        
        <div v-if="question.explanation" class="mt-4 p-3 bg-gray-100 border-l-4 border-blue-400 text-sm italic text-blue-800">
    <span class="font-bold">Correction :</span>
    <p class="whitespace-pre-wrap mt-1">{{ question.explanation }}</p>
</div>
        <span 
        v-if="question.explanationPdfUrl" 
        class="flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-blue-700"
        title="Un PDF d'explication est joint"
      >
        <i class="fas fa-file-pdf mr-1"></i>
        PDF Aide -<a :href="question.explanationPdfUrl" target="_blank" class="underline font-bold"> Voir le fichier</a>
      </span>
    </div>
</template>

<style scoped>
</style>
