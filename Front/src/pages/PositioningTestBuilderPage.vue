<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader :pageTitle="`Configuration du ${displayTitle}`" :showBackButton="false" />
    
    <main class="p-6 md:p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-[#423B71]">{{ displayTitle }}</h1>
          <p class="text-gray-600 mt-1">Élaborez les questions et thématiques pour cette formation.</p>
        </div>
        <div class="flex items-center space-x-3">
            <button 
              @click="saveAndClose" 
              :disabled="testStore.test.isLoading"
              class="px-6 py-2 font-bold text-white bg-[#876EC8] rounded-lg shadow-lg hover:bg-[#6c56a1] transition-all flex items-center disabled:opacity-50"
            >
              <i class="fas fa-save mr-2"></i> 
              {{ testStore.test.isLoading ? 'Enregistrement...' : 'Sauvegarder' }}
            </button>
            <button 
              @click="closeBuilder" 
              class="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
            >
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
      </div>

      <div v-if="testStore.test.isLoading && testStore.test.questions.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#876EC8]"></div>
        <p class="mt-4 text-gray-500 font-medium">Chargement des données...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2 space-y-6">
          
          <QuestionTypeSelector 
            v-if="editingIndex === null" 
            @select-question-type="handleSelectQuestionType" 
          />

          <div v-if="editingIndex !== null" class="bg-white p-6 rounded-2xl shadow-sm border-2 border-[#876EC8]">
            <div class="mb-6 p-4 bg-slate-50 rounded-xl border border-gray-100">
               <label class="text-xs font-black text-[#423B71] uppercase tracking-widest mb-2 block">Thématique / Catégorie</label>
               <input 
                 v-model="testStore.test.questions[editingIndex].category" 
                 type="text" 
                 placeholder="Ex: Pédagogie, Technique, Environnement..."
                 class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#876EC8] outline-none"
               />
            </div>

            <QCMEditor
                v-if="['single-choice', 'multiple-choice', 'true-false'].includes(testStore.test.questions[editingIndex].type)"
                :question="testStore.test.questions[editingIndex]"
                @save-question="handleSaveQuestion"
                @cancel-edit="handleCancelEdit"
            />
            <ImageQCMEditor
                v-if="testStore.test.questions[editingIndex].type === 'image-qcm'"
                :question="testStore.test.questions[editingIndex]"
                @save-question="handleSaveQuestion"
                @cancel-edit="handleCancelEdit"
            />
            <OrderingEditor
                v-if="testStore.test.questions[editingIndex].type === 'ordering'"
                :question="testStore.test.questions[editingIndex]"
                @save-question="handleSaveQuestion"
                @cancel-edit="handleCancelEdit"
            />
            <FillInTheBlanksEditor
                v-if="testStore.test.questions[editingIndex].type === 'fill-in-the-blanks'"
                :question="testStore.test.questions[editingIndex]"
                @save-question="handleSaveQuestion"
                @cancel-edit="handleCancelEdit"
            />
          </div>

          <div v-if="testStore.test.questions.length > 0" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 class="font-bold text-xl text-[#423B71] mb-4">Aperçu des questions</h3>
              <div class="space-y-4">
                  <QuestionPreview
                      v-for="(question, index) in testStore.test.questions"
                      :key="index"
                      :question="question"
                      :index="index"
                      @edit-question="handleEditQuestion"
                      @delete-question="handleDeleteQuestion"
                  />
              </div>
          </div>
          
          <div v-else-if="editingIndex === null" class="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <i class="fas fa-layer-group text-4xl text-gray-200 mb-3"></i>
              <p class="text-gray-400">Aucune question n'a été ajoutée pour le moment.</p>
          </div>
        </div>

        <div class="lg:col-span-1">
            <div class="sticky top-28 bg-[#DCD8F4] p-6 rounded-xl shadow-xl border border-purple-300 space-y-6">
                <h3 class="font-bold text-xl text-[#423B71] mb-2">Paramètres</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="label">Titre affiché</label>
                        <input type="text" v-model="testStore.test.title" class="input-field bg-white/70">
                    </div>

                    <div class="p-3 bg-white/40 rounded-lg border border-white/60 text-center">
                       <span class="text-[10px] font-black text-purple-700 uppercase tracking-tighter">Mode : {{ displayTitle }}</span>
                    </div>

                    <div class="p-4 bg-indigo-100 border-l-4 border-indigo-500 rounded-lg">
                        <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Score Total</p>
                        <p class="text-2xl font-black text-indigo-900 mt-1">{{ totalPoints }} Points</p>
                    </div>

                    <hr class="border-purple-300" />
                    </div>
            </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTestBuilderStore } from '../stores/testBuilder';
import { useFormationsStore } from '../stores/formations';

// Composants
import TheHeader from '../components/TheHeader.vue';
import QuestionTypeSelector from '../components/quiz-builder/QuestionTypeSelector.vue';
import QCMEditor from '../components/quiz-builder/QCMEditor.vue';
import ImageQCMEditor from '../components/quiz-builder/ImageQCMEditor.vue';
import OrderingEditor from '../components/quiz-builder/OrderingEditor.vue';
import FillInTheBlanksEditor from '../components/quiz-builder/FillInTheBlanksEditor.vue';
import QuestionPreview from '../components/quiz-builder/QuestionPreview.vue';

const route = useRoute();
const router = useRouter();
const testStore = useTestBuilderStore();
const formationStore = useFormationsStore();

const formationId = route.params.id as string;
const type = route.params.type as string; // Récupère 'positioning', 'satisfaction_chaud', etc.
const globalPdfInput = ref<HTMLInputElement | null>(null);
const editingIndex = ref<number | null>(null);

// Titre dynamique pour le mode d'édition
const displayTitle = computed(() => {
  if (type === 'positioning') return 'Test de Positionnement';
  if (type === 'satisfaction_chaud') return 'Questionnaire à Chaud';
  if (type === 'satisfaction_froid') return 'Questionnaire à Froid';
  return 'Évaluation';
});

const totalPoints = computed(() => {
    return testStore.test.questions.reduce((sum, q) => sum + (q.points || 0), 0);
});

// UN SEUL onMounted propre
onMounted(async () => {
    testStore.resetTestState();
    if (formationId && type) {
        // On charge le test en fonction de la formation ET du type
        await testStore.fetchTest(formationId, type);
    }
});

/** * GESTION DES QUESTIONS */
const handleSelectQuestionType = (type: any) => {
    testStore.addQuestion(type);
    editingIndex.value = testStore.test.questions.length - 1;
};

const handleSaveQuestion = (updatedQuestion: any) => {
    if (editingIndex.value !== null) {
        testStore.updateQuestion(editingIndex.value, updatedQuestion);
    }
    editingIndex.value = null;
};

const handleCancelEdit = () => {
    if (editingIndex.value !== null) {
        const q = testStore.test.questions[editingIndex.value];
        if (!q._id && (!q.text || q.text === 'Nouvelle question')) {
            testStore.removeQuestion(editingIndex.value);
        }
    }
    editingIndex.value = null;
};

const handleEditQuestion = (index: number) => {
    editingIndex.value = index;
};

const handleDeleteQuestion = (index: number) => {
    if (confirm("Supprimer cette question ?")) {
        testStore.removeQuestion(index);
        if (editingIndex.value === index) editingIndex.value = null;
    }
};

/** * ACTIONS GLOBALES */
const saveAndClose = async () => {
    try {
        // CORRECTION : On passe bien le formationId ET le type au store !
        await testStore.saveTest(formationId, type); 
        router.back();
    } catch (error) {
        console.error("Erreur lors de la sauvegarde :", error);
        alert("Erreur lors de la sauvegarde.");
    }
};

const closeBuilder = () => {
    if (confirm("Voulez-vous quitter ? Les modifications non enregistrées seront perdues.")) {
        router.back();
    }
};
</script>