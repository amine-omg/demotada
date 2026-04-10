<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import TheHeader from '../components/TheHeader.vue';
import ExerciseQuestionList from '../components/exercise-builder/ExerciseQuestionList.vue';
import ExerciseQuestionEditor from '../components/exercise-builder/ExerciseQuestionEditor.vue';
import ExerciseSettingsSidebar from '../components/exercise-builder/ExerciseSettingsSidebar.vue';

const route = useRoute();
const store = useFormationBuilderStore();
const exerciseId = route.params.exerciseId as string;

const currentExercise = ref<any>(null);
const selectedQuestionId = ref<string | null>(null);
const isLoading = ref(true);

const selectedQuestion = computed(() => {
  if (!currentExercise.value?.questions || !selectedQuestionId.value) return null;
  return currentExercise.value.questions.find(q => q._id === selectedQuestionId.value) || null;
});

// Computed N°2 : Trouve l'index de la question sélectionnée
const selectedQuestionIndex = computed(() => {
  if (!currentExercise.value?.questions || !selectedQuestionId.value) return -1; // Retourne -1 si non trouvé
  return currentExercise.value.questions.findIndex(q => q._id === selectedQuestionId.value);
});


onMounted(async () => {
  try {
    currentExercise.value = await store.fetchExerciseById(exerciseId);
    if (currentExercise.value?.questions?.length > 0) {
      selectedQuestionId.value = currentExercise.value.questions[0]._id;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const handleAddQuestion = async () => {
  const updatedExercise = await store.addQuestionToExercise(exerciseId, { questionText: 'Nouvelle question' });
  currentExercise.value = updatedExercise;
  // Sélectionne automatiquement la question nouvellement créée
  selectedQuestionId.value = updatedExercise.questions[updatedExercise.questions.length - 1]._id;
};

const handleSaveQuestion = async (questionData: any) => {
  try {
    await store.updateQuestionInExercise(exerciseId, questionData._id, questionData);
    
    // MISE À JOUR LOCALE APRÈS SUCCÈS
    if (currentExercise.value) {
      const index = currentExercise.value.questions.findIndex(q => q._id === questionData._id);
      if (index !== -1) {
        // On remplace l'ancienne question par la nouvelle version sauvegardée
        currentExercise.value.questions[index] = questionData;
      }
    }
    
    alert('Question sauvegardée !');
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    alert("La sauvegarde a échoué.");
  }
};


const handleSaveSettings = async (settingsData: any) => {
  await store.updateExerciseSettings(exerciseId, settingsData);
  currentExercise.value.title = settingsData.title; // Met à jour le titre localement
  alert('Paramètres sauvegardés !');
};

const handleDeleteQuestion = async (questionId: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
    try {
      await store.deleteQuestionFromExercise(exerciseId, questionId);

      // On met à jour l'état local pour un retour visuel immédiat
      currentExercise.value.questions = currentExercise.value.questions.filter(q => q._id !== questionId);

      // Si la question supprimée était celle sélectionnée, on désélectionne
      if (selectedQuestionId.value === questionId) {
        selectedQuestionId.value = currentExercise.value.questions[0]?._id || null;
      }

      alert('Question supprimée !');
    } catch (error) {
      alert("Erreur lors de la suppression de la question.");
    }
  }
};
</script>

<template>
  <div class="h-screen flex flex-col">
    <TheHeader pageTitle="Retour à la formation" :showBackButton="true" :backButtonRoute="`/formations/${route.params.formationId}`"/>
    <div class="flex-1 flex flex-row overflow-hidden">
      <div v-if="isLoading" class="flex-1 flex items-center justify-center">Chargement...</div>
      <template v-else-if="currentExercise">
        <ExerciseQuestionList
          :questions="currentExercise.questions"
          :selected-question-id="selectedQuestionId"
          @select-question="id => selectedQuestionId = id"
          @add-question="handleAddQuestion"
          @delete-question="handleDeleteQuestion"
        />
        <ExerciseQuestionEditor
          v-if="selectedQuestion"
          :key="selectedQuestion._id"
          :question="selectedQuestion"
          :exercise-title="currentExercise.title"
          :question-index="selectedQuestionIndex"
          @save-question="handleSaveQuestion"
        />
        <ExerciseSettingsSidebar
          :exercise="currentExercise"
          @save-settings="handleSaveSettings"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Assurez-vous que les styles de vos boutons sont accessibles globalement ou définis ici */
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md; }
.btn-primary { @apply bg-[#876EC8] text-white font-bold py-2 px-4 rounded-lg; }
.btn-secondary { @apply bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300; }
</style>