<script setup lang="ts">
import { ref, watch } from 'vue';

interface ImageOption {
    _id?: string;
    imageUrl: string;
    isCorrect: boolean;
}

interface Question {
    _id?: string;
    text: string; 
    type: 'image-qcm'; 
    points: number;
    imageOptions: ImageOption[]; 
}

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits(['save-question', 'cancel-edit']);

const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const addImageOption = () => {
    if (editedQuestion.value.imageOptions.length >= 9) {
        alert("Vous ne pouvez pas ajouter plus de 9 images.");
        return;
    }

    editedQuestion.value.imageOptions.push({
        imageUrl: 'https://via.placeholder.com/150?text=Ajouter+Image', 
        isCorrect: false
    });
};

const removeImageOption = (index: number) => {
    editedQuestion.value.imageOptions.splice(index, 1);
};

const saveQuestion = () => {
    if (editedQuestion.value.imageOptions.length < 2) {
        alert("Un QCM Image doit avoir au moins 2 images.");
        return;
    }
    if (!editedQuestion.value.imageOptions.some(opt => opt.isCorrect)) {
        alert("Veuillez sélectionner au moins une bonne image.");
        return;
    }
    emit('save-question', editedQuestion.value);
};

const cancelEdit = () => {
    emit('cancel-edit');
};

const handleImageUpload = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                editedQuestion.value.imageOptions[index].imageUrl = e.target.result as string;
            }
        };
        reader.readAsDataURL(file);
        alert("L'upload d'image nécessite une implémentation backend réelle pour persister l'image.");
     }
};

</script>

<template>
    <div class="bg-white p-8 rounded-lg shadow-sm border space-y-6">
        <div>
            <label class="label font-semibold">Consigne de la question (texte principal)</label>
            <textarea v-model="editedQuestion.text" class="input-field" rows="2" placeholder="Ex: Sélectionnez les images représentant des fruits."></textarea>
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
            <h3 class="label font-semibold">Options d'images</h3>
            <p class="text-xs text-gray-500 mb-2">Cochez la ou les bonnes images (entre 2 et 9).</p>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="(imgOption, index) in editedQuestion.imageOptions" :key="imgOption._id || index" class="relative border rounded-lg p-2 flex flex-col items-center">
                    <div class="absolute top-2 left-2 z-10">
                        <input
                            type="checkbox"
                            v-model="imgOption.isCorrect"
                            class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                    </div>
                    <div class="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden mb-2">
                        <img v-if="imgOption.imageUrl" :src="imgOption.imageUrl" alt="Option Image" class="max-w-full max-h-full object-contain">
                        <span v-else class="text-gray-400 text-sm">Pas d'image</span>
                    </div>

                    <input type="text" v-model="imgOption.imageUrl" placeholder="URL de l'image" class="input-field text-xs mb-2">
                    <label class="btn-secondary text-xs px-2 py-1 cursor-pointer w-full text-center">
                        Uploader
                        <input type="file" @change="handleImageUpload($event, index)" class="hidden" accept="image/*">
                    </label>

                    <button @click="removeImageOption(index)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <button @click="addImageOption" class="btn-secondary text-sm mt-4">
                + Ajouter une image
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
