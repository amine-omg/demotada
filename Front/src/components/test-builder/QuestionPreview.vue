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
    text: string; // Aligné avec testBuilder.ts
    type: 'single-choice' | 'multiple-choice' | 'true-false' | 'image-qcm' | 'ordering' | 'fill-in-the-blanks';
    points: number;
    imageUrl?: string; 
    options?: Option[]; 
    explanation?: string;
    imageOptions?: ImageOption[]; 
    orderingElements?: OrderingElement[]; 
    blankOptions?: BlankOption[]; 
    blankTextContent?: string; 
}

const props = defineProps<{
  question: Question;
  index: number; // Requis pour la gestion précise dans le store
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
  // On émet l'index pour que le parent sache quelle question ouvrir
  emit('edit-question', props.index);
  
  // Scroll fluide vers l'éditeur en haut de page
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
    <div class="border p-4 rounded-xl bg-gray-50 hover:bg-white transition-all border-gray-200 shadow-sm flex flex-col space-y-3 relative group">
        <div v-if="question.points" class="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-lg shadow-sm">
            {{ question.points }} PTS
        </div>

        <div class="flex items-center justify-between">
            <h4 class="font-bold text-gray-800 flex items-center text-sm uppercase tracking-tight">
                <i :class="getQuestionTypeIcon" class="mr-2"></i>
                {{ getQuestionTypeLabel }}
            </h4>
            <div class="flex space-x-1">
                <button 
                    @click.stop="handleEditClick" 
                    class="w-8 h-8 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                >
                    <i class="fas fa-pen text-xs"></i>
                </button>
                <button 
                    @click.stop="emit('delete-question', index)" 
                    class="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full transition-colors"
                >
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
        </div>

        <p class="text-gray-700 text-sm font-semibold whitespace-pre-wrap leading-relaxed">
            {{ question.text || 'Sans intitulé' }}
        </p>

        <div v-if="question.imageUrl" class="mt-2">
            <img 
                :src="question.imageUrl" 
                class="h-24 w-auto rounded-lg border border-gray-200 shadow-sm object-cover"
            />
        </div>

        <div class="space-y-1 text-xs mt-2 border-t border-gray-100 pt-3">
            
            <div v-if="question.options && question.options.length > 0">
                <div
                    v-for="(option, idx) in question.options"
                    :key="idx"
                    class="flex items-center py-1"
                    :class="getOptionTextColorClass(option.isCorrect)"
                >
                    <i :class="getOptionIconClass(option.isCorrect)" class="mr-2"></i>
                    <span :class="{'font-bold': option.isCorrect}">{{ option.text }}</span>
                </div>
            </div>

            <div v-if="question.type === 'image-qcm' && question.imageOptions && question.imageOptions.length > 0" class="flex flex-wrap gap-2 mt-2">
                <div v-for="(img, idx) in question.imageOptions" :key="idx" class="relative">
                    <img :src="img.imageUrl" class="w-16 h-16 object-cover rounded-md border-2" :class="img.isCorrect ? 'border-green-500' : 'border-gray-200'">
                    <i v-if="img.isCorrect" class="fas fa-check-circle absolute -top-1 -right-1 text-green-500 bg-white rounded-full text-[10px]"></i>
                </div>
            </div>

            <div v-if="question.type === 'ordering' && question.orderingElements && question.orderingElements.length > 0">
                <div class="space-y-1">
                    <div v-for="(el, idx) in [...question.orderingElements].sort((a,b) => a.order - b.order)" :key="idx" class="flex items-center text-gray-600 bg-white px-2 py-1 rounded border border-gray-100">
                        <span class="font-bold mr-2 text-indigo-400">{{ idx + 1 }}.</span>
                        {{ el.text }}
                    </div>
                </div>
            </div>

            <div v-if="question.type === 'fill-in-the-blanks'" class="bg-gray-100 p-2 rounded text-[11px] italic text-gray-600 border border-gray-200">
                {{ question.blankTextContent }}
            </div>
        </div>
        
        <div v-if="question.explanation" class="mt-2 p-2 bg-blue-50/50 rounded-lg border-l-2 border-blue-400 text-[11px] text-blue-800 italic">
            <strong>Note de correction :</strong> {{ question.explanation }}
        </div>
    </div>
</template>