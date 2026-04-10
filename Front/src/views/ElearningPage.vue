<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useFormationsStore } from '../stores/formations';
import { useProgressionStore } from '../stores/progressionStore';
import PdfViewerModal from '../components/modals/PdfViewerModal.vue';
import { useSessionStore } from '../stores/sessionStore'; 


const route = useRoute();
const router = useRouter(); 
const formationStore = useFormationsStore();
const progressionStore = useProgressionStore();
const sessionStore = useSessionStore();

const isLoading = ref(true);

const sessionId = route.params.id as string;
const chapterId = route.params.chapterId as string;
const formationId = ref<string | null>(null); 

const pdfToView = ref<{ url: string; id: string; } | null>(null);

const currentFormation = computed(() => formationStore.currentFormation);
const currentChapter = computed(() => {
    if (!currentFormation.value) return null;
    for (const module of currentFormation.value.modules) {
        const chapter = module.chapters.find(c => c._id === chapterId);
        if (chapter) return chapter;
    }
    return null;
});
const progressions = computed(() => progressionStore.progressions);

const isChapterComplete = computed(() => {
    if (!currentChapter.value) return false;

    // 1. On filtre pour ne garder que les activités OBLIGATOIRES
    const mandatoryContents = currentChapter.value.contents.filter(
      (content: any) => !content.isOptionalForCompletion
    );

    // Si il n'y a aucun contenu obligatoire, le chapitre peut être considéré comme terminé.
    if (mandatoryContents.length === 0) return true;

    // 2. On vérifie ensuite si TOUTES ces activités obligatoires sont terminées
    return mandatoryContents.every((content: any) =>
        getContentStatus(content._id) === 'termine'
    );
});

onMounted(async () => {
  try {
    isLoading.value = true;
    
    // ÉTAPE 1 : On charge la session pour trouver l'ID de la formation
    const session = await sessionStore.fetchSessionById(sessionId);
    if (session && typeof session.formation === 'object' && session.formation?._id) {
        formationId.value = session.formation._id;
    } else {
        throw new Error("Impossible de trouver l'ID de la formation depuis la session.");
    }

    // ÉTAPE 2 : Maintenant qu'on a l'ID, on charge la formation complète
    await formationStore.fetchFormationById(formationId.value);
    
    // ÉTAPE 3 : On charge la progression de l'élève
    await progressionStore.fetchProgressionForSession(sessionId);
    
    // ÉTAPE 4 : Le log va maintenant s'afficher car `currentChapter` a des données !
    await nextTick();
    console.log("Données BRUTES du chapitre courant:", currentChapter.value);

  } catch (error) {
    console.error("Erreur critique lors du chargement de ElearningPage:", error);
    // Optionnel : rediriger l'utilisateur s'il y a une erreur de chargement
    // router.push('/mes-formations');
  } finally {
    isLoading.value = false;
  }
});

const getContentStatus = (contentId: string) => {
    const progression = progressions.value.find(p => p.contentId === contentId);
    return progression ? progression.status : 'a_faire';
};

const openContent = (content: any) => {
    if (content.type === 'Lesson' && content.pdfUrl) {
        pdfToView.value = { url: content.pdfUrl, id: content._id };
    } else {
        alert(`Logique à venir pour le contenu : ${content.title}`);
    }
};


const closePdfViewer = () => {
    pdfToView.value = null;
};

const handleCompleteActivity = async (activityId: string) => {
    await progressionStore.completeContent(sessionId, activityId, 'Activity');
    closePdfViewer();
};

const handleCompleteChapter = async () => {
    if (!currentChapter.value) return;
    await progressionStore.completeContent(sessionId, currentChapter.value._id, 'Chapter');
    alert("Félicitations ! Chapitre terminé.");
};


</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader
      :pageTitle="currentChapter ? currentChapter.title : 'Cours'"
      :showBackButton="true"
      :backButtonRoute="`/classe/${sessionId}/module/${currentChapter?.parentModule}`"
    />
    <main class="max-w-4xl mx-auto p-6 md:p-8">
      <div v-if="currentChapter" class="bg-white p-8 rounded-lg shadow-md">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">{{ currentChapter.title }}</h1>
        
        <div class="space-y-3">
            <div 
              v-for="content in currentChapter.contents" 
              :key="content._id"
              @click="openContent(content)"
              class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border"
              :class="{ 'opacity-60 bg-green-50': getContentStatus(content._id) === 'termine' }"
            >
           <div class="flex items-center">
              <span class="mr-4 text-xl w-6 text-center">
                 <span v-if="getContentStatus(content._id) === 'termine'" title="Terminé">✅</span>
                 <span v-else-if="getContentStatus(content._id) === 'soumis'" title="En attente de correction">📬</span>
                 <span v-else title="À faire">📝</span>
              </span>
              <p class="font-medium text-gray-800">{{ content.title }}</p>
            </div>
              <span class="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">{{ content.type }}</span>
           </div>
        </div>

        <div class="mt-12 text-center border-t pt-8">
          <button 
            @click="handleCompleteChapter"
            :disabled="!isChapterComplete"
            :class="[
                'font-bold py-3 px-8 rounded-lg shadow-lg transition-all',
                isChapterComplete ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
          >
            J'ai terminé ce chapitre
          </button>
        </div>
      </div>
    </main>
    
    <PdfViewerModal
      v-if="pdfToView"
      :show="!!pdfToView"
      :pdf-url="pdfToView.url"
      @close="closePdfViewer"
      @on-complete="handleCompleteActivity(pdfToView.id)"
    />
  </div>
</template>