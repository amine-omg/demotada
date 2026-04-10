<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useFormationsStore } from '../stores/formations';
import { useProgressionStore } from '../stores/progressionStore';
import PdfViewerModal from '../components/modals/PdfViewerModal.vue';
import QuizRunnerModal from '../components/modals/QuizRunnerModal.vue';
import ExerciseViewerModal from '../components/modals/ExerciseViewerModal.vue';
import LessonBlockViewerModal from '../components/modals/LessonBlockViewerModal.vue';
import CreateIncidentModal from '../components/modals/CreateIncidentModal.vue';
import api from '/services/api';
import { useStudyTracker } from '../composables/useStudyTracker';

// 1. Définition des props et initialisation des stores
const props = defineProps<{
  id: string; // sessionId
  moduleId: string;
}>();

useStudyTracker(() => props.id, 'elearning');

const router = useRouter();
const formationStore = useFormationsStore();
const progressionStore = useProgressionStore();


// 2. Déclaration des variables réactives
const isLoading = ref(true);
const selectedChapter = ref<any>(null);
const pdfToView = ref<{ url: string; id: string; } | null>(null);
const quizToRun = ref<{ id: string; contentId: string; } | null>(null);
const exerciseToView = ref<{ id: string; } | null>(null);
const lessonBlocksToView = ref<any>(null);
const isIncidentModalOpen = ref(false);

// 3. Déclaration des computed properties qui ne dépendent que des stores et props
const currentModule = computed(() => formationStore.currentFormation?.modules.find(m => m._id === props.moduleId));
const progressions = computed(() => progressionStore.progressions);

// 4. DÉCLARATION DE TOUTES LES FONCTIONS
// Elles sont maintenant définies avant que quiconque ne puisse les appeler.

const getContentStatus = (contentId: string) => {
  const progression = progressions.value.find(p => p.contentId === contentId);
  return progression ? progression.status : 'a_faire';
};

const isChapterUnlocked = (chapterId: string) => {
  return getContentStatus(chapterId) !== 'bloque';
};

const selectChapter = async (chapter: any) => {
  if (isChapterUnlocked(chapter._id)) {
    selectedChapter.value = chapter;
    await progressionStore.getOrInitializeActivityProgression(props.id, chapter._id);
  } else {
    alert("Terminez le chapitre précédent pour continuer.");
  }
};

const selectContent = (content: any) => {
  const status = getContentStatus(content._id);
  if (status === 'bloque') return alert("Contenu bloqué.");

  switch (content.type) {
    case 'Lesson':
      // 1. S'il y a un PDF, on affiche le PdfViewer
      if (content.pdfUrl) {
        pdfToView.value = { url: content.pdfUrl, id: content._id };
      } 
      // 2. Sinon, s'il y a des blocs configurés, on lance le mode "Slides"
      else if (content.blocks && content.blocks.length > 0) {
        lessonBlocksToView.value = content; 
      } 
      // 3. Leçon vide
      else {
        alert("Cette leçon ne contient pas encore de contenu (ni PDF, ni vidéo/texte).");
      }
      break;

    case 'Support':
      if (content.pdfUrl) {
        pdfToView.value = { url: content.pdfUrl, id: content._id };
      } else {
        alert("Erreur: pdfUrl manquant pour ce support.");
      }
      break;
    
    case 'Exercise':
      exerciseToView.value = { id: content._id };
      break;

    case 'Quiz':
  quizToRun.value = { 
    id: content.activityId || content._id, // ID pour charger le quiz (API)
    contentId: content._id                  // ID pour la progression (Store)
  };
  break;

    default:
      alert(`Logique à venir pour le contenu : '${content.type}'`);
  }
};

const getQuizScore = (content) => {
  // On cherche la progression correspondant au quiz
  const progression = progressions.value.find(p => p.contentId === content._id);
  
  // Si on a une progression et que le score existe (même s'il vaut 0)
  if (progression && typeof progression.score !== 'undefined') {
    console.log("Ma progression pour ce quiz:", progression);
    const score = progression.score; // C'est ici que le '2' du log doit arriver
    const total = content.totalPossibleScore || 0;
    
    return `${score} / ${total}`;
  }
  
  // Si aucune tentative n'a été faite
  return `0 / ${content.totalPossibleScore || 0}`;
};

const getQuizSuccess = (content) => {
  const progression = progressions.value.find(p => p.contentId === content._id);
  if (!progression || typeof progression.score === 'undefined') return false;

  // Appuyons-nous sur ce que le serveur considère comme réussi (vu dans ton log)
  // On utilise minScoreToPass (ex: 7 pour le quiz 1, 3 pour le quiz 2)
  const minRequired = content.minScoreToPass || 0;
  
  return progression.score >= minRequired;
};

const handleIncidentSubmit = async (payload: { type: string, titre: string, description: string }) => {
  try {
    // On prépare le contexte complet pour l'admin
    const incidentData = {
      ...payload,
      sessionId: props.id, // ID de la session
      formationId: formationStore.currentFormation?._id, // ID de la formation
      contexte: {
        module: props.moduleId, // ID du module actuel
        chapitre: selectedChapter.value?._id, // ID du chapitre sélectionné
      }
    };

    await api.post('/api/incidents', incidentData);
    
    // Fermeture et feedback
    isIncidentModalOpen.value = false;
    alert("Votre signalement a bien été transmis à l'équipe pédagogique.");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'incident:", error);
    alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
  }
};

const closeAllViewers = () => {
    pdfToView.value = null;
    quizToRun.value = null;
    exerciseToView.value = null;
    lessonBlocksToView.value = null;
};


const handleCompleteChapter = async () => {
  if (!selectedChapter.value) return;
  await progressionStore.completeContent(props.id, selectedChapter.value._id, 'Chapter');
  alert("Félicitations ! Chapitre terminé.");
};

// 5. UTILISATION DES FONCTIONS DANS LES COMPUTED ET HOOKS
// Ces blocs sont maintenant placés en dernier, après la déclaration des fonctions qu'ils utilisent.

const isCurrentChapterComplete = computed(() => {
    if (!selectedChapter.value) return false;
    const mandatoryContents = selectedChapter.value.contents.filter(
      (content: any) => !content.isOptionalForCompletion
    );
    if (mandatoryContents.length === 0) return true;
    return mandatoryContents.every((content: any) =>
        getContentStatus(content._id) === 'termine'
    );
});

const downloadAndCompleteSupport = async (content: any) => {
  if (content.pdfUrl) {
    window.open(content.pdfUrl, '_blank');
    await handleCompleteActivity(content._id);
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    // 1. Charger la progression en premier
    await progressionStore.fetchProgressionForSession(props.id);
    
    // 2. Vérifier si le module et les chapitres sont chargés
    if (currentModule.value?.chapters?.length) {
      // Utilisation de la fonction locale getContentStatus pour plus de sécurité
      const firstUnlocked = currentModule.value.chapters.find(chap => 
        getContentStatus(chap._id) !== 'bloque'
      );

      if (firstUnlocked) {
        await selectChapter(firstUnlocked);
      }
    }
  } catch (e) { 
    console.error("Erreur au montage de ElearningModulePage:", e); 
  } finally { 
    isLoading.value = false; 
  }
});

onBeforeRouteUpdate(async (to, from) => {
  if (to.name === 'elearning-module') {
    await progressionStore.fetchProgressionForSession(props.id);
  }
});

const handleCompleteActivity = async (activityId: string, scoreFromQuiz?: number) => {
    const content = selectedChapter.value?.contents.find((c: any) => c._id === activityId);
    
    try {
        // ON ENVOIE TOUJOURS 'Activity' POUR SATISFAIRE LA BASE DE DONNÉES
        await progressionStore.completeContent(
            props.id, 
            activityId, 
            'Activity', 
            scoreFromQuiz, 
            content?.totalPossibleScore || 0
        );

        await progressionStore.fetchProgressionForSession(props.id); 
        
        if (selectedChapter.value) {
            await progressionStore.getOrInitializeActivityProgression(props.id, selectedChapter.value._id);
        }
    } catch (err) {
        console.error("Erreur lors de l'enregistrement de l'activité :", err);
    } finally {
        closeAllViewers();
    }
};
</script>

<template>



  <div class="flex flex-col h-screen bg-gray-100">
    <TheHeader
      :pageTitle="currentModule ? currentModule.name : 'Module'"
      :showBackButton="true"
      :backButtonRoute="`/classe/${id}`"
    />
    
  <main class="flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-8 overflow-y-auto">

      <div class="block lg:hidden mb-6">
  <select 
    @change="(e) => {
      const id = (e.target as HTMLSelectElement).value;
      const chap = currentModule.chapters.find(c => c._id === id);
      if (chap) selectChapter(chap);
    }"
    class="w-full p-3 border border-gray-300 rounded-xl bg-white shadow-sm font-medium"
  >
    <option v-for="chapter in currentModule?.chapters" :key="chapter._id" :value="chapter._id" :selected="selectedChapter?._id === chapter._id">
      {{ getContentStatus(chapter._id) === 'termine' ? '✅' : '▶️' }} {{ chapter.title }}
    </option>
  </select>
</div>


      <div class="w-full lg:w-2/3 bg-white p-8 rounded-lg shadow-md h-full overflow-y-auto">
        <div v-if="isLoading">Chargement...</div>
        <div v-else-if="selectedChapter">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-800">{{ selectedChapter.title }}</h1>
    
    <button 
      @click="isIncidentModalOpen = true"
      class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#8A79E2] hover:text-white border border-[#8A79E2] hover:bg-[#8A79E2] rounded-lg transition-all"
      title="Signaler un problème sur ce chapitre"
    >
      <i class="fas fa-life-ring"></i>
      <span>Aide</span>
    </button>
  </div>
  <div class="space-y-3">
            <div 
              v-for="content in selectedChapter.contents" 
              :key="content._id"
              @click="getContentStatus(content._id) === 'termine' && content.type === 'Quiz' ? null : selectContent(content)"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md transition-colors border"
              :class="[
                getContentStatus(content._id) === 'termine' && content.type === 'Quiz' 
                  ? 'cursor-default opacity-80 bg-green-50/30' 
                  : 'hover:bg-indigo-50 cursor-pointer'
              ]"
            >
              <div class="flex items-center">
                <span class="mr-4 text-xl w-6 text-center">
                   <span v-if="getContentStatus(content._id) === 'termine'" title="Terminé">✅</span>
                   <span v-else title="À faire">📝</span>
                </span>
                
                <div>
                  <p class="font-medium text-gray-800">{{ content.title }}</p>
                  
                  <div v-if="content.type === 'Quiz' && getContentStatus(content._id) === 'termine'" class="flex items-center gap-2 mt-1">
  
  <span v-if="getQuizSuccess(content)" class="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-wider">
    Validé
  </span>
  <span v-else class="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wider">
    Échec
  </span>

  <span class="text-xs text-gray-500 font-semibold">
    Note : {{ getQuizScore(content) }}
  </span>
</div>

                </div>
              </div>

              <span v-if="content.type !== 'Support'" class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full uppercase font-mono">
                {{ content.type }}
              </span>

              <button 
                v-else
                @click.stop="downloadAndCompleteSupport(content)"
                class="text-gray-500 hover:text-indigo-600 p-2 rounded-full transition-colors"
                title="Télécharger et marquer comme terminé"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a1 1 0 01-1-1V3a1 1 0 112 0v8a1 1 0 01-1 1zM3 13a1 1 0 112 0v2h10v-2a1 1 0 112 0v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-8 border-t pt-6 text-center">
            <button 
              @click="handleCompleteChapter"
              :disabled="!isCurrentChapterComplete"
              :class="[
                'font-bold py-2 px-6 rounded-lg transition-all',
                isCurrentChapterComplete ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              J'ai terminé ce chapitre
            </button>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-full">
          <p class="text-gray-500">Sélectionnez un chapitre pour commencer.</p>
        </div>
      </div>

      <aside class="hidden lg:block w-1/3 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <div v-if="currentModule">
          <h2 class="text-xl font-bold text-gray-800 mb-6">{{ currentModule.name }}</h2>
          <nav class="space-y-2">
            <a
              v-for="chapter in currentModule.chapters"
              :key="chapter._id"
              @click.prevent="selectChapter(chapter)"
              href="#"
              :class="[
                'block p-3 rounded-md text-sm font-medium transition-colors flex items-center',
                isChapterUnlocked(chapter._id) ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed',
                selectedChapter?._id === chapter._id ? 'bg-indigo-100 font-semibold text-indigo-700' : ''
              ]"
            >
              <span class="mr-3 text-xl">
                <span v-if="getContentStatus(chapter._id) === 'termine'">✅</span>
                <span v-else-if="getContentStatus(chapter._id) === 'en_cours'">▶️</span>
                <span v-else>▶️</span>
              </span>
              {{ chapter.title }}
            </a>
          </nav>
        </div>
      </aside>
    </main>
    <PdfViewerModal
  v-if="pdfToView"
  :show="!!pdfToView"
  :pdf-url="pdfToView.url"
  :content-id="pdfToView.id"
  :session-id="id" 
  :module-id="moduleId"
  :chapter-id="selectedChapter?._id"
  :formation-id="formationStore.currentFormation?._id"
  @close="closeAllViewers"
  @on-complete="handleCompleteActivity(pdfToView.id)"
/>

    <ExerciseViewerModal
      v-if="exerciseToView"
      :show="!!exerciseToView"
      :exercise-id="exerciseToView.id"
      :session-id="id" 
      :chapter-id="selectedChapter._id" 
      @close="closeAllViewers"
      @on-complete="handleCompleteActivity(exerciseToView.id)"
    />

   <QuizRunnerModal
  v-if="quizToRun"
  :show="!!quizToRun"
  :quiz-id="quizToRun.id"
  :session-id="id"
  :chapter-id="selectedChapter?._id"
  :module-id="moduleId"
  :formation-id="formationStore.currentFormation?._id"
  @close="quizToRun = null"
  @on-complete="(score) => handleCompleteActivity(quizToRun.contentId, score)" 
/>

<LessonBlockViewerModal
      v-if="lessonBlocksToView"
      :show="!!lessonBlocksToView"
      :lesson="lessonBlocksToView"
      @close="closeAllViewers"
      @on-complete="handleCompleteActivity(lessonBlocksToView._id)"
    />
<CreateIncidentModal 
  :showModal="isIncidentModalOpen"
  @close="isIncidentModalOpen = false"
  @submit="handleIncidentSubmit"
/>
    
  </div>
</template>