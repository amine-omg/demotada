<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface BlankOption {
    _id?: string;
    text: string; 
}

interface Question {
    _id?: string;
    text: string; 
    type: 'fill-in-the-blanks'; 
    points: number;
    blankTextContent: string; 
    blankOptions: BlankOption[]; 
}

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits(['save-question', 'cancel-edit']);

const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const correctBlanksFromText = computed(() => {
    const matches = editedQuestion.value.blankTextContent.matchAll(/{([^}]+)}/g);
    return Array.from(matches).map(match => match[1].trim());
});

const allRequiredBlanksArePresent = computed(() => {
    const required = new Set(correctBlanksFromText.value.map(s => s.toLowerCase()));
    const available = new Set(editedQuestion.value.blankOptions.map(opt => opt.text.toLowerCase()));

    for (const reqWord of required) {
        if (!available.has(reqWord)) {
            return false;
        }
    }
    return true;
});

const addBlankOption = () => {
    editedQuestion.value.blankOptions.push({
        text: '' 
    });
};

const removeBlankOption = (index: number) => {
    editedQuestion.value.blankOptions.splice(index, 1);
};

const saveQuestion = () => {
    if (!editedQuestion.value.blankTextContent.trim()) {
        alert("Veuillez saisir le texte à compléter avec les marqueurs de trous (ex: 'Le {chat} est noir.').");
        return;
    }
    if (editedQuestion.value.blankOptions.length === 0) {
        alert("Veuillez ajouter au moins un mot disponible pour le drag-and-drop.");
        return;
    }
    if (!allRequiredBlanksArePresent.value) {
        alert("Attention : Tous les mots entre accolades dans le texte principal doivent être présents dans la liste des 'Mots disponibles'.");
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
            <textarea v-model="editedQuestion.text" class="input-field" rows="2" placeholder="Ex: Complétez les phrases avec les mots corrects."></textarea>
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
            <label class="label font-semibold">Texte à compléter (avec les marqueurs de trous)</label>
            <textarea v-model="editedQuestion.blankTextContent" class="input-field" rows="4" placeholder="Ex: Le {chat} est un animal {domestique}."></textarea>
            <p class="text-xs text-gray-500 mt-1">Utilisez des accolades comme `{mot_manquant}` pour indiquer les trous. Le mot à l'intérieur est la réponse correcte attendue.</p>
            <p v-if="correctBlanksFromText.length > 0" class="text-sm text-gray-600 mt-2">
                Mots détectés dans le texte : <span class="font-medium text-purple-700">{{ correctBlanksFromText.join(', ') }}</span>
                <span v-if="!allRequiredBlanksArePresent" class="text-red-500 ml-2">(Certains mots manquent dans la liste "Mots disponibles")</span>
                <span v-else class="text-green-500 ml-2">(Tous les mots détectés sont dans la liste "Mots disponibles")</span>
            </p>
            <p v-else class="text-sm text-gray-600 mt-2">Aucun mot manquant détecté (utilisez `{}`)</p>
        </div>

        <div>
            <h3 class="label font-semibold">Mots disponibles pour le Drag & Drop</h3>
            <p class="text-xs text-gray-500 mb-2">Ajoutez les mots que l'élève pourra glisser dans les trous (inclure les mots exacts des trous et d'éventuels distracteurs).</p>
            <div class="space-y-3">
                <div v-for="(option, index) in editedQuestion.blankOptions" :key="option._id || index" class="flex items-center space-x-3 bg-gray-50 p-2 rounded-md border">
                    <input type="text" v-model="option.text" class="input-field flex-grow" placeholder="Ex: chat, domestique, oiseau...">
                    <button @click="removeBlankOption(index)" class="text-gray-400 hover:text-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <button @click="addBlankOption" class="btn-secondary text-sm mt-4">
                + Ajouter un mot disponible
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
