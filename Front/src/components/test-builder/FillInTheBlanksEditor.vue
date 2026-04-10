<script setup lang="ts">
import { ref, watch } from 'vue';

interface BlankOption { text: string; }
interface Question {
    _id?: string;
    text: string;
    type: 'fill-in-the-blanks';
    blankTextContent: string;
    blankOptions: BlankOption[];
    points: number;
}

const props = defineProps<{ question: Question }>();
const emit = defineEmits(['save-question', 'cancel-edit']);

const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const saveQuestion = () => {
    if (!editedQuestion.value.blankTextContent.includes('{')) {
        return alert("Le texte doit contenir au moins un mot entre accolades {mot}");
    }
    emit('save-question', editedQuestion.value);
};
</script>

<template>
    <div class="bg-white p-6 rounded-xl border-2 border-teal-100 shadow-sm space-y-6">
        <div>
            <label class="label text-teal-600">Consigne</label>
            <input v-model="editedQuestion.text" type="text" class="input-field" placeholder="Ex: Remplissez les trous dans le texte">
        </div>

        <div>
            <label class="label">Édition du texte (utiliser {mot} pour créer un trou)</label>
            <textarea v-model="editedQuestion.blankTextContent" rows="4" class="input-field font-serif italic text-base" placeholder="Ex: Le {soleil} brille aujourd'hui."></textarea>
            <p class="mt-2 text-[10px] text-gray-400 italic font-medium">Les mots entre accolades seront masqués et proposés sous forme de choix ou à glisser.</p>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-50">
            <button @click="$emit('cancel-edit')" class="px-4 py-2 text-gray-400 font-bold uppercase text-xs">Annuler</button>
            <button @click="saveQuestion" class="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold uppercase text-xs shadow-md">Enregistrer</button>
        </div>
    </div>
</template>

<style scoped>
.label { @apply block text-[10px] font-black uppercase tracking-widest mb-1 text-gray-500; }
.input-field { @apply w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 outline-none text-sm transition-all; }
</style>