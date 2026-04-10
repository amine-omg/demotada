<template>
  <div>
    <TheHeader pageTitle="Constructeur de Quiz" :showBackButton="false" />
    <main class="p-6 md:p-8">
       <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-[#423B71]">Constructeur de Quiz</h1>
          <p class="text-gray-600 mt-1">Élaborez vos questions et définissez les règles de votre évaluation.</p>
        </div>
        <div class="flex items-center space-x-2">
            <button @click="saveAndClose" class="px-6 py-2 font-bold text-white bg-[#876EC8] rounded-lg shadow-lg hover:bg-[#6c56a1] transition-colors">
                Sauvegarder
            </button>
            <button @click="closeBuilder" class="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2 space-y-6">

          <QuestionTypeSelector v-if="!editingQuestion" @select-question-type="handleSelectQuestionType" />

          <QCMEditor
            v-if="editingQuestion && (editingQuestion.type === 'single-choice' || editingQuestion.type === 'multiple-choice' || editingQuestion.type === 'true-false')"
            :question="editingQuestion"
            @save-question="handleSaveQuestion"
            @cancel-edit="handleCancelEdit"
          />
          <ImageQCMEditor
            v-if="editingQuestion && editingQuestion.type === 'image-qcm'"
            :question="editingQuestion"
            @save-question="handleSaveQuestion"
            @cancel-edit="handleCancelEdit"
          />
          <OrderingEditor
            v-if="editingQuestion && editingQuestion.type === 'ordering'"
            :question="editingQuestion"
            @save-question="handleSaveQuestion"
            @cancel-edit="handleCancelEdit"
          />
          <FillInTheBlanksEditor
            v-if="editingQuestion && editingQuestion.type === 'fill-in-the-blanks'"
            :question="editingQuestion"
            @save-question="handleSaveQuestion"
            @cancel-edit="handleCancelEdit"
          />


          <div v-if="quiz.questions && quiz.questions.length > 0" class="bg-white p-6 rounded-lg shadow-sm border">
              <h3 class="font-bold text-xl text-[#423B71] mb-4">Questions du quiz</h3>
              <div class="space-y-4">
                  <QuestionPreview
                      v-for="question in quiz.questions"
                      :key="question._id || question.text"
                      :question="question"
                      @edit-question="handleEditQuestion"
                      @delete-question="handleDeleteQuestion"
                  />
              </div>
          </div>
          <div v-else-if="!store.isLoading && (!quiz.questions || quiz.questions.length === 0)">
              <p class="text-center text-gray-500 py-8">Aucune question n'a été ajoutée à ce quiz pour le moment.</p>
          </div>
        </div>


<div class="lg:col-span-1">
            <div class="sticky top-28 bg-[#DCD8F4] p-6 rounded-lg shadow-xl border border-purple-300">
                <h3 class="font-bold text-xl text-[#423B71] mb-6">Paramètres du Quiz</h3>
                <div class="space-y-4">
                    <div>
                        <label class="label">Titre du Quiz</label>
                        <input type="text" v-model="quiz.title" class="input-field bg-white/70">
                    </div>
                    <div>
                        <label class="label">Description</label>
                        <textarea v-model="quiz.description" class="input-field bg-white/70" rows="4"></textarea>
                    </div>

                    <hr class="border-purple-400" />
    <h3 class="text-sm font-bold text-[#423B71] uppercase tracking-wider">Validation & Notation</h3>

                    <div class="mb-4 p-3 bg-indigo-100 border-l-4 border-indigo-500 rounded-md">
            <p class="text-sm font-medium text-indigo-700">
                Score Total Maximum
            </p>
            <p class="text-2xl font-extrabold text-indigo-900 mt-1">
                {{ totalPoints }} Points
            </p>
        </div>



    <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Note minimale de réussite</label>
        <div class="flex items-center space-x-2">
            <input 
                type="number" 
                v-model="store.quiz.minScoreToPass" 
                class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#876EC8] outline-none"
                placeholder="Ex: 7"
            />
            <span class="text-sm text-gray-400">points</span>
        </div>
    </div>

    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div class="flex flex-col">
            <span class="text-sm font-semibold text-[#423B71]">Contrôle continu</span>
            <span class="text-[10px] text-gray-500 uppercase">Compte pour la moyenne</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="store.quiz.isContinuousAssessment" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B2E9E1]"></div>
        </label>
    </div>

                    <hr class="border-purple-400" />
        <h3 class="text-sm font-bold text-[#423B71] uppercase tracking-wider">Fichier de correction globale</h3>


    <div v-if="store.quiz.explanationPdfUrl" class="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
        <div class="flex items-center text-indigo-700 overflow-hidden">
            <i class="fas fa-file-pdf mr-2 flex-shrink-0"></i>
            <span class="text-xs truncate italic">Fichier attaché -<a :href="store.quiz.explanationPdfUrl" target="_blank" class="underline font-bold">Voir le fichier</a></span>
        </div>
        <button @click="store.quiz.explanationPdfUrl = ''" class="text-red-400 hover:text-red-600 ml-2">
            <i class="fas fa-trash-alt"></i>
        </button>
    </div>



    <button 
        @click="triggerGlobalPdfUpload" 
        type="button" 
        class="w-full py-3 px-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#876EC8] hover:text-[#876EC8] hover:bg-indigo-50 transition-all duration-200 flex flex-col items-center justify-center space-y-1"
    >
        <i class="fas fa-cloud-upload-alt text-xl"></i>
        <span class="text-xs font-semibold">
            {{ store.quiz.explanationPdfUrl ? 'Remplacer le PDF' : 'Uploader la correction (PDF)' }}
        </span>
    </button>
    
    <input type="file" ref="globalPdfInput" @change="handleGlobalPdfUpload" class="hidden" accept="application/pdf" />


                    </div>
            </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuizBuilderStore } from '../stores/quizBuilder';
import TheHeader from '../components/TheHeader.vue';
import QuestionTypeSelector from '../components/quiz-builder/QuestionTypeSelector.vue';
import QCMEditor from '../components/quiz-builder/QCMEditor.vue';
import QuestionPreview from '../components/quiz-builder/QuestionPreview.vue';
import ImageQCMEditor from '../components/quiz-builder/ImageQCMEditor.vue';
import OrderingEditor from '../components/quiz-builder/OrderingEditor.vue';
import FillInTheBlanksEditor from '../components/quiz-builder/FillInTheBlanksEditor.vue';

import { useFormationBuilderStore } from '../stores/formationBuilder';

const formationStore = useFormationBuilderStore();
// Garde ton store de quiz habituel à côté
const quizStore = useQuizBuilderStore();

const route = useRoute();
const router = useRouter();
const store = useQuizBuilderStore();

const globalPdfInput = ref<HTMLInputElement | null>(null);


const quizId = computed(() => route.params.quizId as string);
const quiz = computed(() => store.quiz);

const editingQuestion = ref<any | null>(null);

const totalPoints = computed(() => {
    return store.quiz.questions.reduce((sum, question) => sum + (question.points || 0), 0);
});

watch(quiz, (newQuiz) => {
  console.log('Quiz data updated:', newQuiz);
  console.log('Quiz Questions:', newQuiz.questions);
}, { deep: true, immediate: true });

watch(totalPoints, (newTotal) => {
    store.quiz.totalPossibleScore = newTotal;
}, { immediate: true });

onMounted(() => {
    console.log('QuizBuilderPage mounted. Quiz ID:', quizId.value);
    if (quizId.value) {
        store.loadQuiz(quizId.value)
            .then(() => {
                console.log('Quiz loaded successfully in QuizBuilderPage:', store.quiz);
            })
            .catch(error => {
                console.error('Error loading quiz in QuizBuilderPage:', error);
            });
    } else {
        store.resetQuizState();
    }
});


const handleSelectQuestionType = (type: string) => {
    if (editingQuestion.value) {
        alert("Veuillez d'abord enregistrer ou annuler la question en cours d'édition.");
        return;
    }
    store.addQuestion(type);
    editingQuestion.value = store.quiz.questions[store.quiz.questions.length - 1];
    console.log('Editing question set (newly created):', editingQuestion.value);
    console.log('Full questions array after setting editingQuestion (newly created):', JSON.parse(JSON.stringify(store.quiz.questions)));
};

const handleSaveQuestion = (updatedQuestion: any) => {
    console.log('handleSaveQuestion called. updatedQuestion received:', JSON.parse(JSON.stringify(updatedQuestion)));
    console.log('Current editingQuestion.value:', JSON.parse(JSON.stringify(editingQuestion.value)));
    console.log('Current store.quiz.questions BEFORE update:', JSON.parse(JSON.stringify(store.quiz.questions)));

    let indexToUpdate = -1;

    if (updatedQuestion._id) {
        indexToUpdate = store.quiz.questions.findIndex(q => q._id === updatedQuestion._id);
        console.log(`Found existing question by ID at index: ${indexToUpdate}`);
    } else if (editingQuestion.value) {
        indexToUpdate = store.quiz.questions.findIndex(q => q === editingQuestion.value);
        console.log(`Found new question by reference at index: ${indexToUpdate}`);
    }

    if (indexToUpdate !== -1) {
        store.quiz.questions[indexToUpdate] = updatedQuestion;
        console.log(`Question at index ${indexToUpdate} updated in store.`);
    } else {
        console.error('Error: Question to save not found in store. This should not happen.');
    }

    editingQuestion.value = null;
    console.log('Editing mode exited. Full questions array AFTER update:', JSON.parse(JSON.stringify(store.quiz.questions)));
    console.log("Question sauvegardée localement. N'oubliez pas de sauvegarder le quiz !");
};


const handleCancelEdit = () => {
    console.log('handleCancelEdit called.');
    if (!editingQuestion.value?._id) {
        const indexToRemove = store.quiz.questions.findIndex(q => q === editingQuestion.value);
        if (indexToRemove !== -1) {
            store.quiz.questions.splice(indexToRemove, 1);
            console.log('New unsaved question removed from store by reference.');
        } else {
            console.warn('Could not find new unsaved question by reference to remove.');
        }
    }
    editingQuestion.value = null;
    console.log('Editing mode exited after cancel. Full questions array:', JSON.parse(JSON.stringify(store.quiz.questions)));
};


const handleEditQuestion = (questionId: string) => {
    console.log('handleEditQuestion called for ID:', questionId);
    if (editingQuestion.value) {
        alert("Veuillez d'abord enregistrer ou annuler la question en cours d'édition.");
        return;
    }
    const questionToEdit = store.quiz.questions.find(q => q._id === questionId);
    if (questionToEdit) {
        editingQuestion.value = JSON.parse(JSON.stringify(questionToEdit));
        console.log('Editing existing question:', editingQuestion.value);
    } else {
        console.warn('Question to edit not found with ID:', questionId);
    }
};

const handleDeleteQuestion = (questionId: string) => {
    console.log('handleDeleteQuestion called for ID:', questionId);
    if (confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
        store.quiz.questions = store.quiz.questions.filter(q => q._id !== questionId);
        if (editingQuestion.value?._id === questionId) {
            editingQuestion.value = null;
            console.log('Deleted question was being edited, cleared editor.');
        }
        console.log("Question supprimée localement. N'oubliez pas de sauvegarder le quiz !");
        console.log('Full questions array after deletion:', JSON.parse(JSON.stringify(store.quiz.questions)));
    }
};

const saveAndClose = async () => {
    try {
        await store.saveQuiz();
        router.back();
    } catch (error) {
        alert("Erreur de sauvegarde. Vérifiez la console pour plus de détails.");
        console.error("Erreur lors de la sauvegarde du quiz:", error);
    }
};

const closeBuilder = () => {
    if(confirm("Voulez-vous quitter sans sauvegarder ?")) {
        router.back();
    }
}

const triggerGlobalPdfUpload = () => globalPdfInput.value?.click();

const handleGlobalPdfUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  
  const file = target.files[0];
  try {
    // ON UTILISE LE STORE QUI A LA FONCTION (formationStore)
    const newUrl = await formationStore.uploadLessonFile(file); 
    
    // ON ENREGISTRE L'URL DANS LE QUIZ (quizStore)
    quizStore.quiz.explanationPdfUrl = newUrl;
    
    alert('PDF de correction globale ajouté !');
  } catch (error) {
    console.error("Erreur upload PDF global:", error);
    alert("L'upload a échoué.");
  }
};

</script>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent; }
</style>
