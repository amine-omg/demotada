<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFormationsStore } from '../../stores/formations';

const formationStore = useFormationsStore();

interface Option {
    id?: string;
    _id?: string;
    text: string;
    isCorrect: boolean;
}

// Interface alignée avec testBuilder.ts
interface Question {
    _id?: string;
    text: string; // Changé de questionText à text
    type: 'single-choice' | 'multiple-choice' | 'true-false';
    options: Option[];
    points: number;
    explanation?: string;
    imageUrl?: string;
}

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits(['save-question', 'cancel-edit']);

// Clonage pour édition locale
const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const addOption = () => {
    editedQuestion.value.options.push({
        text: '',
        isCorrect: false
    });
};

const removeOption = (index: number) => {
    editedQuestion.value.options.splice(index, 1);
};

const toggleCorrect = (index: number) => {
    if (editedQuestion.value.type === 'single-choice' || editedQuestion.value.type === 'true-false') {
        editedQuestion.value.options.forEach((opt, i) => {
            opt.isCorrect = i === index;
        });
    } else {
        editedQuestion.value.options[index].isCorrect = !editedQuestion.value.options[index].isCorrect;
    }
};

const handleImageUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.[0]) return;
    try {
        const url = await formationStore.uploadLessonFile(target.files[0]);
        editedQuestion.value.imageUrl = url;
    } catch (error) {
        alert("Erreur upload image");
    }
};

const saveQuestion = () => {
    if (!editedQuestion.value.text.trim()) { // Changé questionText à text
        alert("La question ne peut pas être vide");
        return;
    }
    emit('save-question', editedQuestion.value);
};
</script>

<template>
    <div class="bg-white p-6 rounded-xl border-2 border-[#876EC8]/20 shadow-sm space-y-6">
        <div class="flex justify-between items-start">
            <h3 class="text-lg font-bold text-[#423B71]">Édition de la question</h3>
            <span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {{ editedQuestion.type }}
            </span>
        </div>

        <div>
            <label class="label">Question</label>
            <textarea
                v-model="editedQuestion.text" 
                rows="3"
                class="input-field"
                placeholder="Ex: Quelle est la capitale de la France ?"
            ></textarea>
        </div>

        <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div v-if="editedQuestion.imageUrl" class="relative w-20 h-20">
                <img :src="editedQuestion.imageUrl" class="w-full h-full object-cover rounded border" />
                <button @click="editedQuestion.imageUrl = ''" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px]">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex-1">
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Illustration (Optionnel)</label>
                <input type="file" @change="handleImageUpload" accept="image/*" class="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
        </div>

        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <label class="label mb-0">Options de réponse</label>
                <span class="text-[10px] text-gray-400 font-bold uppercase">Cochez la bonne réponse</span>
            </div>
            
            <div v-for="(option, index) in editedQuestion.options" :key="index" class="flex items-center space-x-3 group">
                <button 
                    @click="toggleCorrect(index)"
                    class="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all"
                    :class="option.isCorrect ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'border-gray-200 bg-white hover:border-green-300'"
                >
                    <i class="fas fa-check"></i>
                </button>

                <input
                    type="text"
                    v-model="option.text"
                    class="input-field flex-1 !py-3"
                    :placeholder="'Option ' + (index + 1)"
                />

                <button 
                    v-if="editedQuestion.options.length > 2"
                    @click="removeOption(index)" 
                    class="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>

            <button v-if="editedQuestion.type !== 'true-false'" @click="addOption" class="text-sm font-bold text-[#876EC8] hover:text-[#6c56a1] flex items-center mt-2 px-2">
                <i class="fas fa-plus-circle mr-2"></i> Ajouter une option
            </button>
        </div>

        <hr class="border-gray-100" />

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="md:col-span-1">
                <label class="label">Points</label>
                <input
                    type="number"
                    v-model.number="editedQuestion.points"
                    min="0"
                    class="input-field"
                />
            </div>
            <div class="md:col-span-3">
                <label class="label">Explication (Feedback)</label>
                <textarea
                    v-model="editedQuestion.explanation"
                    rows="1"
                    class="input-field"
                    placeholder="Pourquoi cette réponse est-elle correcte ?"
                ></textarea>
            </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-50">
            <button @click="$emit('cancel-edit')" class="px-5 py-2 text-gray-500 hover:text-gray-700 font-bold text-sm uppercase tracking-wide">
                Annuler
            </button>
            <button @click="saveQuestion" class="px-8 py-3 bg-[#876EC8] text-white rounded-xl hover:bg-[#6c56a1] shadow-lg shadow-indigo-200 transition-all font-bold uppercase text-sm tracking-wider">
                Valider la question
            </button>
        </div>
    </div>
</template>

<style scoped>
.label { @apply block text-xs font-black text-gray-500 uppercase tracking-wider mb-2; }
.input-field { @apply w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#876EC8]/20 focus:border-[#876EC8] transition-all text-sm; }
</style>