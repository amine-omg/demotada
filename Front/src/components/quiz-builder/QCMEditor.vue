<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuizBuilderStore } from '../../stores/quizBuilder';
import { useFormationBuilderStore } from '../../stores/formationBuilder';
import api from '/services/api';

const formationStore = useFormationBuilderStore();

interface Option {
    _id?: string;
    text: string;
    isCorrect: boolean;
}
interface Question {
    _id?: string;
    text: string;
    type: 'single-choice' | 'multiple-choice' | 'true-false';
    options: Option[];
    points: number;
    explanation: string;
}

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits(['save-question', 'cancel-edit']);

const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

const store = useQuizBuilderStore();
const pdfInput = ref<HTMLInputElement | null>(null);

const triggerPdfUpload = () => pdfInput.value?.click();

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const addOption = () => {
    editedQuestion.value.options.push({
        text: `Nouvelle option ${editedQuestion.value.options.length + 1}`,
        isCorrect: false
    });
};

const removeOption = (index: number) => {
    editedQuestion.value.options.splice(index, 1);
};

const handleSingleChoiceSelection = (selectedIndex: number) => {
    editedQuestion.value.options.forEach((option, idx) => {
        option.isCorrect = (idx === selectedIndex); // Only the selected one is true
    });
};

const saveQuestion = () => {
    if (!editedQuestion.value.options.some(opt => opt.isCorrect)) {
        alert("Veuillez sélectionner au moins une bonne réponse.");
        return;
    }
    if (editedQuestion.value.type === 'single-choice') {
        const correctCount = editedQuestion.value.options.filter(opt => opt.isCorrect).length;
        if (correctCount !== 1) {
            alert("Pour les questions à choix unique (QCM), vous devez sélectionner exactement une bonne réponse.");
            return;
        }
    }
    emit('save-question', editedQuestion.value);
};

const handlePdfUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  
  const file = target.files[0];
  try {
    // Affichez un log pour vérifier que la fonction est appelée
    console.log("Début de l'upload pour:", file.name);
    
    // Assurez-vous d'utiliser l'action qui existe dans votre store
    // Si votre store est 'quizBuilder', vérifiez si l'action s'appelle 'uploadFile' ou 'uploadLessonFile'
const newUrl = await formationStore.uploadLessonFile(file);

    console.log("Upload réussi, URL reçue:", newUrl);
    editedQuestion.value.explanationPdfUrl = newUrl;
    alert('PDF d\'explication uploadé !');
  } catch (error) {
    // MODIFICATION ICI : Affichez l'erreur complète dans la console
    console.error("Détails de l'erreur d'upload:", error);
    alert("L'upload a échoué. Regardez la console (F12) pour le détail.");
  }
};

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    console.log("Début de l'upload de l'image via le store...");
    
    // On réutilise la fonction du store qui fonctionne pour les PDF
    const newUrl = await formationStore.uploadLessonFile(file);

    console.log("Image uploadée avec succès, URL:", newUrl);
    
    // On assigne l'URL à imageUrl
    editedQuestion.value.imageUrl = newUrl;
    
    alert('Image d\'illustration uploadée !');
  } catch (error) {
    console.error("Détails de l'erreur d'upload image:", error);
    alert("L'upload de l'image a échoué.");
  }
};
</script>

<template>
    <div class="bg-white p-8 rounded-lg shadow-sm border space-y-6">
        <div>
            <label class="label font-semibold">Enoncé de la question</label>
            <textarea v-model="editedQuestion.text" class="input-field" rows="3" placeholder="Ex: Quelle est la capitale de la France ?"></textarea>

         <div class="mb-6">
<br>    
    <div v-if="editedQuestion.imageUrl" class="mb-4 relative inline-block group">
        <img :src="editedQuestion.imageUrl" class="h-48 w-auto rounded-xl border-2 border-purple-100 shadow-md" />
        <button 
            type="button"
            @click="editedQuestion.imageUrl = ''" 
            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
        >
            <i class="fas fa-times"></i>
        </button>
    </div>

    <div class="flex items-center gap-4">
        <input 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            class="hidden" 
            id="qcm-image-upload"
        />
        <label 
            for="qcm-image-upload" 
            class="btn-secondary cursor-pointer flex items-center gap-2"
        >
            <i class="fas fa-image"></i>
            {{ editedQuestion.imageUrl ? 'Remplacer l\'image' : 'Uploader une image' }}
        </label>
        <p v-if="!editedQuestion.imageUrl" class="text-xs text-gray-400 italic">
            Format supportés : JPG, PNG, GIF (Max 10MB)
        </p>
    </div>
</div>


           
              

    <div class="mt-2">
    <div v-if="editedQuestion.explanationPdfUrl" class="text-xs text-green-700 bg-green-50 p-2 rounded-md mb-2 flex justify-between items-center">
        <span>PDF joint : <a :href="editedQuestion.explanationPdfUrl" target="_blank" class="underline font-bold">Voir le fichier</a></span>
        <button @click="editedQuestion.explanationPdfUrl = ''" class="text-red-500 hover:text-red-700">Supprimer</button>
    </div>
    
    <button @click="triggerPdfUpload" type="button" class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded border border-dashed border-gray-400 w-full transition-colors">
        <i class="fas fa-file-pdf mr-2"></i>
        {{ editedQuestion.explanationPdfUrl ? 'Remplacer le PDF d\'aide' : 'Ajouter un PDF d\'aide (optionnel)' }}
    </button>
    <input type="file" ref="pdfInput" @change="handlePdfUpload" class="hidden" accept="application/pdf" />
</div>
        </div>

        <div>
            <h3 class="label font-semibold">Options de réponse</h3>
            <p class="text-xs text-gray-500 mb-2">
                <span v-if="editedQuestion.type === 'single-choice'">Cochez la bonne réponse unique.</span>
                <span v-else>Cochez la ou les bonnes réponses.</span>
            </p>
            <div class="space-y-3">
                <div v-for="(option, index) in editedQuestion.options" :key="index" class="flex items-center space-x-3">
                    <input
                        :type="editedQuestion.type === 'single-choice' ? 'radio' : 'checkbox'"
                        :name="`question-${editedQuestion._id || 'new'}`" :checked="option.isCorrect"
                        @change="editedQuestion.type === 'single-choice' ? handleSingleChoiceSelection(index) : (option.isCorrect = !option.isCorrect)"
                        class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <input type="text" v-model="option.text" class="input-field flex-grow" />
                    <button @click="removeOption(index)" class="text-gray-400 hover:text-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <button @click="addOption" class="btn-secondary text-sm mt-4">
                + Ajouter une option
            </button>
        </div>

        <hr />

          <label class="label" for="question-points">Points (Valeur)</label>
                <input
                    type="number"
                    id="question-points"
                    v-model.number="editedQuestion.points"
                    min="0"
                    class="input-field"
                />
             
    <label class="label" for="question-explanation">Correction (Explication pédagogique)</label>
    <textarea
        id="question-explanation"
        v-model="editedQuestion.explanation"
        rows="2"
        class="input-field"
        placeholder="Expliquez pourquoi la réponse est correcte..."
    ></textarea>

        <div class="flex justify-end space-x-4">
            <button @click="$emit('cancel-edit')" class="btn-secondary">Annuler</button>
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
