<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface OrderingElement {
    _id?: string;
    text: string;
    order: number; 
}

interface Question {
    _id?: string;
    text: string; 
    type: 'ordering'; 
    points: number;
    orderingElements: OrderingElement[]; 
}

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits(['save-question', 'cancel-edit']);

const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const sortedOrderingElements = computed(() => {
  return [...editedQuestion.value.orderingElements].sort((a, b) => a.order - b.order);
});

const addOrderingElement = () => {
    const nextOrder = editedQuestion.value.orderingElements.length > 0
        ? Math.max(...editedQuestion.value.orderingElements.map(e => e.order)) + 1
        : 1;

    editedQuestion.value.orderingElements.push({
        text: `Nouvel élément ${nextOrder}`,
        order: nextOrder
    });
  };

const removeOrderingElement = (indexToRemove: number) => {
    editedQuestion.value.orderingElements.splice(indexToRemove, 1);

    editedQuestion.value.orderingElements.forEach((element, idx) => {
        element.order = idx + 1;
    });
};


const moveOrderingElement = (index: number, direction: 'up' | 'down') => {
    const elements = editedQuestion.value.orderingElements;
    const currentSortedElements = [...elements].sort((a, b) => a.order - b.order);

    if (direction === 'up' && index > 0) {
        const itemToMove = currentSortedElements[index];
        const itemAbove = currentSortedElements[index - 1];

        const originalIndexItemToMove = elements.findIndex(e => e._id === itemToMove._id);
        const originalIndexItemAbove = elements.findIndex(e => e._id === itemAbove._id);

        if (originalIndexItemToMove !== -1 && originalIndexItemAbove !== -1) {
            [elements[originalIndexItemToMove].order, elements[originalIndexItemAbove].order] =
            [elements[originalIndexItemAbove].order, elements[originalIndexItemToMove].order];
        }

    } else if (direction === 'down' && index < elements.length - 1) {
        const itemToMove = currentSortedElements[index];
        const itemBelow = currentSortedElements[index + 1];

        const originalIndexItemToMove = elements.findIndex(e => e._id === itemToMove._id);
        const originalIndexItemBelow = elements.findIndex(e => e._id === itemBelow._id);

        if (originalIndexItemToMove !== -1 && originalIndexItemBelow !== -1) {
            [elements[originalIndexItemToMove].order, elements[originalIndexItemBelow].order] =
            [elements[originalIndexItemBelow].order, elements[originalIndexItemToMove].order];
        }
    }
};


const saveQuestion = () => {
    if (editedQuestion.value.orderingElements.length < 2) {
        alert("Une question d'ordonnancement doit avoir au moins 2 éléments.");
        return;
    }
    emit('save-question', editedQuestion.value);
};

const cancelEdit = () => {
    emit('cancel-edit');
};
</script>

<template>
    <div class="bg-white p-8 rounded-lg shadow-sm border space-y-6">
        <div>
            <label class="label font-semibold">Consigne de la question</label>
            <textarea v-model="editedQuestion.text" class="input-field" rows="2" placeholder="Ex: Remettez les étapes suivantes dans l'ordre chronologique."></textarea>
      <div class="w-full sm:w-1/3 mb-4">
    <label class="label" for="question-points">Points (Valeur)</label>
    <input
        type="number"
        id="question-points"
        v-model.number="editedQuestion.points"
        min="0"
        class="input-field"
    />
    <div class="w-full mb-4">
    <label class="label" for="question-explanation">Correction (Explication pédagogique)</label>
    <textarea
        id="question-explanation"
        v-model="editedQuestion.explanation"
        rows="2"
        class="input-field"
        placeholder="Expliquez pourquoi la réponse est correcte..."
    ></textarea>
</div>
</div>
        </div>

        <div>
            <h3 class="label font-semibold">Éléments à ordonner</h3>
            <p class="text-xs text-gray-500 mb-2">Définissez les éléments et leur ordre correct.</p>
            <div class="space-y-3">
                <div v-for="(element, index) in sortedOrderingElements" :key="element._id || index" class="flex items-center space-x-3 bg-gray-50 p-3 rounded-md border">
                    <span class="font-bold text-lg text-gray-700 w-8 flex-shrink-0">{{ element.order }}.</span>
                    <input type="text" v-model="element.text" class="input-field flex-grow" placeholder="Texte de l'élément">

                    <div class="flex flex-col space-y-1">
                        <button @click="moveOrderingElement(index, 'up')" :disabled="index === 0" class="text-gray-500 hover:text-blue-600 disabled:opacity-50">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button @click="moveOrderingElement(index, 'down')" :disabled="index === sortedOrderingElements.length - 1" class="text-gray-500 hover:text-blue-600 disabled:opacity-50">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                    <button @click="removeOrderingElement(editedQuestion.orderingElements.findIndex(e => e._id === element._id))" class="text-gray-400 hover:text-red-600 ml-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <button @click="addOrderingElement" class="btn-secondary text-sm mt-4">
                + Ajouter un élément
            </button>
        </div>

        <hr />

        <div class="flex justify-end space-x-4">
            <button @click="cancelEdit" class="btn-secondary">Annuler</button>
            <button @click="saveQuestion" class="btn-primary">Enregistrer la question</button>
        </div>
    </div>
</template>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent; }
.btn-primary { @apply bg-[#B0E9DF] text-black font-medium px-4 py-2 rounded-md; }
.btn-secondary { @apply bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md; }
</style>
