<script setup lang="ts">
import { ref, watch } from 'vue';

interface OrderingElement {
    id?: string;
    _id?: string;
    text: string;
    order: number;
}

interface Question {
    _id?: string;
    text: string;
    type: 'ordering';
    orderingElements: OrderingElement[];
    points: number;
    explanation?: string;
}

const props = defineProps<{ question: Question }>();
const emit = defineEmits(['save-question', 'cancel-edit']);

const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const addElement = () => {
    const nextOrder = editedQuestion.value.orderingElements.length + 1;
    editedQuestion.value.orderingElements.push({ text: '', order: nextOrder });
};

const removeElement = (index: number) => {
    editedQuestion.value.orderingElements.splice(index, 1);
    editedQuestion.value.orderingElements.forEach((el, i) => el.order = i + 1);
};

const saveQuestion = () => {
    if (!editedQuestion.value.text.trim()) return alert("L'intitulé est requis");
    emit('save-question', editedQuestion.value);
};
</script>

<template>
    <div class="bg-white p-6 rounded-xl border-2 border-indigo-100 shadow-sm space-y-6">
        <div>
            <label class="label text-indigo-600">Consigne de l'exercice</label>
            <textarea v-model="editedQuestion.text" rows="2" class="input-field" placeholder="Ex: Rangez ces étapes dans l'ordre chronologique"></textarea>
        </div>

        <div class="space-y-3">
            <div class="flex items-center justify-between"><label class="label mb-0">Éléments à ordonner</label></div>
            <div v-for="(element, index) in editedQuestion.orderingElements" :key="index" class="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span class="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full font-bold text-xs">{{ index + 1 }}</span>
                <input type="text" v-model="element.text" class="input-field flex-1" placeholder="Élément...">
                <button @click="removeElement(index)" class="text-gray-300 hover:text-red-500 px-2"><i class="fas fa-trash"></i></button>
            </div>
            <button @click="addElement" class="text-sm font-bold text-indigo-600 mt-2 px-2 flex items-center"><i class="fas fa-plus-circle mr-2"></i> Ajouter une étape</button>
        </div>

        <div class="grid grid-cols-4 gap-4 pt-4 border-t border-gray-50">
            <div class="col-span-1"><label class="label">Points</label><input type="number" v-model.number="editedQuestion.points" class="input-field"></div>
            <div class="col-span-3"><label class="label">Feedback</label><input type="text" v-model="editedQuestion.explanation" class="input-field" placeholder="Explication de l'ordre correct"></div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
            <button @click="$emit('cancel-edit')" class="px-4 py-2 text-gray-400 font-bold uppercase text-xs">Annuler</button>
            <button @click="saveQuestion" class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold uppercase text-xs shadow-md">Enregistrer</button>
        </div>
    </div>
</template>

<style scoped>
.label { @apply block text-[10px] font-black uppercase tracking-widest mb-1 text-gray-500; }
.input-field { @apply w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all; }
</style>