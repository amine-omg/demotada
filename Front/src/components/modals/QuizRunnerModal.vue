<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '/services/api';
import draggable from 'vuedraggable';
import CreateIncidentModal from './CreateIncidentModal.vue';

const props = defineProps<{
  show: boolean;
  quizId: string;
  sessionId: string;
  chapterId: string;
  moduleId?: string;    // Pour le contexte du ticket
  formationId?: string; // Pour le contexte du ticket
}>();

const emit = defineEmits(['close', 'on-complete']);

// --- ÉTATS ORIGINAUX (CONSERVÉS) ---
const quiz = ref<any>(null);
const orderedItems = ref<any[]>([]);
const currentStep = ref<'intro' | 'questions' | 'result'>('intro');
const currentIndex = ref(0);
const isLoading = ref(true);
const selectedAnswers = ref<string[]>([]);
const isAnswered = ref(false);
const score = ref(0);
const showConfetti = ref(false);
const userAnswers = ref<any[]>([]);

// --- NOUVEAUX ÉTATS UI ---
const isFullscreen = ref(false);
const isIncidentModalOpen = ref(false);

// --- FONCTIONS CORE (CONSERVÉES SANS RÉGRESSION) ---

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const currentQuestion = computed(() => {
  if (!quiz.value || !quiz.value.questions || !quiz.value.questions[currentIndex.value]) {
    return null;
  }
  return quiz.value.questions[currentIndex.value];
});

const isSelected = (optionId: string) => selectedAnswers.value.includes(optionId);

const toggleOption = (optionId: string) => {
  if (isAnswered.value) return;
  if (currentQuestion.value.type === 'single-choice' || currentQuestion.value.type === 'true-false') {
    selectedAnswers.value = [optionId];
  } else if (currentQuestion.value.type === 'multiple-choice') {
    const index = selectedAnswers.value.indexOf(optionId);
    if (index > -1) {
      selectedAnswers.value.splice(index, 1);
    } else {
      selectedAnswers.value.push(optionId);
    }
  }
};

const initQuestion = () => {
  selectedAnswers.value = [];
  isAnswered.value = false;
  if (currentQuestion.value?.type === 'ordering') {
    orderedItems.value = shuffleArray(currentQuestion.value.orderingElements);
  }
};

const totalPossiblePoints = computed(() => {
  if (!quiz.value || !quiz.value.questions) return 0;
  return quiz.value.questions.reduce((acc, q) => acc + (q.points || 1), 0);
});

onMounted(async () => {
  isLoading.value = true;
  try {
    if (!props.quizId) {
      console.error("ID du quiz manquant");
      return;
    }
    const res = await api.get(`/api/quizzes/${props.quizId}`); 
    quiz.value = res.data;
    console.log("Quiz récupéré avec succès:", quiz.value);
  } catch (e: any) {
    console.error("Erreur détaillée lors de la récupération du quiz:");
    if (e.response) {
      console.error("Status:", e.response.status, "Data:", e.response.data);
    } else {
      console.error("Message:", e.message);
    }
  } finally {
    isLoading.value = false;
  }
});

const progress = computed(() => quiz.value ? ((currentIndex.value) / quiz.value.questions.length) * 100 : 0);

const handleAnswer = () => {
  if (currentQuestion.value.type !== 'ordering' && selectedAnswers.value.length === 0) return;
  isAnswered.value = true;
  const question = currentQuestion.value;
  let isCorrect = false;

  if (['single-choice', 'multiple-choice', 'true-false'].includes(question.type)) {
    if (question.type === 'multiple-choice') {
      const correctOptionIds = question.options.filter((o: any) => o.isCorrect).map((o: any) => o._id);
      isCorrect = correctOptionIds.length === selectedAnswers.value.length && 
                  correctOptionIds.every(id => selectedAnswers.value.includes(id));
    } else {
      const option = question.options.find((o: any) => o._id === selectedAnswers.value[0]);
      isCorrect = option?.isCorrect || false;
    }
  } else if (question.type === 'ordering') {
    isCorrect = orderedItems.value.every((item, index) => item.order === index + 1);
  }

  if (isCorrect) score.value += (question.points || 1);

  userAnswers.value.push({
    questionId: question._id,
    selectedOptions: question.type === 'ordering' ? [] : [...selectedAnswers.value],
    orderedIds: question.type === 'ordering' ? orderedItems.value.map(i => i._id) : [],
    isCorrect
  });
};

const nextStep = async () => {
  if (currentIndex.value < quiz.value.questions.length - 1) {
    currentIndex.value++;
    initQuestion();
  } else {
    try {
      console.log("Dernière question validée. Envoi des résultats au serveur...");
      const payload = {
        sessionId: props.sessionId,
        answers: userAnswers.value,
        score: score.value,      
        points: score.value,     
        totalScore: totalPossiblePoints.value
      };
      const res = await api.post(`/api/quiz-attempts/quizzes/${props.quizId}/attempts`, payload);
      showConfetti.value = res.data.passed === true;
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de la tentative:", err);
    } finally {
      currentStep.value = 'result';
      emit('on-complete', score.value);
    }
  }
};

// --- LOGIQUE ASSISTANCE ---
const handleIncidentSubmit = async (payload: any) => {
  try {
    const incidentData = {
      ...payload,
      sessionId: props.sessionId,
      formationId: props.formationId,
      contexte: {
        typeSupport: 'QUIZ',
        quizId: props.quizId,
        activite: props.quizId,
        questionIndex: currentIndex.value,
        questionText: currentQuestion.value?.text,
        module: props.moduleId,
        chapitre: props.chapterId
      }
    };
    await api.post('/api/incidents', incidentData);
    isIncidentModalOpen.value = false;
    alert("Votre signalement a été transmis.");
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 backdrop-blur-md bg-[#423B71]/90 transition-all duration-300">
    
    <div 
      :class="[
        'bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-500 ease-in-out relative overflow-hidden',
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[92vh] rounded-[2.5rem] border-4 border-white'
      ]"
    >
      <header class="bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-[#DCD8F4] rounded-2xl flex items-center justify-center text-[#423B71] shadow-sm">
            <i class="fas fa-rocket text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-black text-[#423B71] tracking-tighter leading-tight">Défi Quiz</h3>
            <p v-if="quiz" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">{{ quiz.title }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button @click="isIncidentModalOpen = true" class="flex items-center gap-2 px-3 py-2 bg-[#EFEAFB] text-[#8A79E2] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#8A79E2] hover:text-white transition-all">
            <i class="fas fa-life-ring"></i>
            <span class="hidden sm:inline">Un problème ?</span>
          </button>
          <div class="w-px h-8 bg-gray-100 mx-1"></div>
          <button @click="isFullscreen = !isFullscreen" class="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:text-[#423B71] transition-all">
            <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
          <button @click="emit('close')" class="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all ml-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </header>

      <div v-if="currentStep === 'questions' && quiz" class="h-2 w-full bg-gray-50">
        <div class="h-full bg-[#B2E9E1] transition-all duration-700 ease-out shadow-[0_0_15px_#B2E9E1]" :style="{ width: progress + '%' }"></div>
      </div>

      <main class="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
        
        <div v-if="isLoading" class="flex flex-col justify-center items-center h-full space-y-6">
          <i class="fas fa-circle-notch fa-spin text-5xl text-[#8A79E2]"></i>
          <p class="font-black text-[#423B71] uppercase tracking-widest text-xs">Initialisation du quiz...</p>
        </div>

        <div v-else-if="!quiz" class="text-center py-20 bg-red-50 rounded-[2rem] border-2 border-dashed border-red-100">
           <i class="fas fa-exclamation-triangle text-red-500 text-5xl mb-6"></i>
           <p class="text-red-600 font-black text-xl uppercase tracking-tighter">Erreur de chargement</p>
           <button @click="$emit('close')" class="mt-8 px-10 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Fermer</button>
        </div>

        <div v-else-if="currentStep === 'intro'" class="text-center space-y-10 animate-in fade-in zoom-in duration-500 max-w-xl mx-auto py-10">
          <div class="inline-block p-8 bg-[#DCD8F4] rounded-[2.5rem] text-[#423B71] text-6xl shadow-inner transform -rotate-3">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <h1 class="text-5xl font-black text-[#423B71] tracking-tighter leading-none">{{ quiz?.title }}</h1>
          <div class="flex justify-center gap-4">
            <div class="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 flex flex-col items-center min-w-[120px]">
               <span class="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Questions</span>
               <span class="text-2xl font-black text-[#423B71]">{{ quiz?.questions?.length || 0 }}</span>
            </div>
            <div class="bg-[#FFE4E1] px-6 py-4 rounded-3xl border border-[#FF8B7D]/20 flex flex-col items-center min-w-[120px]">
               <span class="text-[10px] font-black text-[#FF8B7D] uppercase tracking-widest mb-1">Objectif</span>
               <span class="text-2xl font-black text-[#FF8B7D]">{{ quiz?.minScoreToPass || 0 }} pts</span>
            </div>
          </div>
          <button @click="currentStep = 'questions'; initQuestion();" class="w-full py-6 bg-[#423B71] text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-[#8A79E2] hover:-translate-y-1 transition-all uppercase tracking-widest">
            Commencer le Test
          </button>
        </div>

        <div v-else-if="currentStep === 'questions' && currentQuestion" class="space-y-8 animate-in slide-in-from-right duration-500 max-w-2xl mx-auto">
          <div class="space-y-4">
            <span class="text-[10px] font-black text-[#8A79E2] uppercase tracking-[0.3em] bg-[#EFEAFB] px-4 py-1.5 rounded-full">
               Question {{ currentIndex + 1 }} sur {{ quiz.questions.length }}
            </span>
            <h2 class="text-3xl font-black text-[#423B71] leading-tight whitespace-pre-line">{{ currentQuestion.text }}</h2>
          </div>

          <p v-if="currentQuestion.type === 'multiple-choice'" class="text-xs font-bold text-[#8A79E2] italic uppercase tracking-widest">* Plusieurs réponses possibles</p>
          <p v-if="currentQuestion.type === 'ordering'" class="text-xs font-bold text-[#8A79E2] italic uppercase tracking-widest">* Faites glisser pour ordonner</p>

          <div v-if="currentQuestion.imageUrl" class="rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-xl">
             <img :src="currentQuestion.imageUrl" alt="Question illustration" class="w-full h-auto max-h-72 object-contain bg-white" />
          </div>

          <div class="space-y-4">
            <template v-if="currentQuestion.type === 'ordering'">
              <draggable v-model="orderedItems" item-key="_id" :disabled="isAnswered" ghost-class="opacity-50" class="space-y-3">
                <template #item="{ element, index }">
                  <div :class="['w-full p-6 rounded-[1.5rem] border-2 font-bold transition-all flex items-center justify-between',
                    !isAnswered ? 'border-gray-100 bg-gray-50 hover:bg-white hover:border-[#8A79E2] cursor-move' : '',
                    isAnswered && element.order === index + 1 ? 'bg-green-50 border-green-500 text-green-700' : '',
                    isAnswered && element.order !== index + 1 ? 'bg-red-50 border-red-500 text-red-700' : '']">
                    <div class="flex items-center gap-6">
                      <span class="w-10 h-10 bg-white text-[#423B71] rounded-2xl flex items-center justify-center text-sm font-black shadow-sm">{{ index + 1 }}</span>
                      <span class="text-lg">{{ element.text }}</span>
                    </div>
                    <i class="fas fa-grip-lines text-gray-300"></i>
                  </div>
                </template>
              </draggable>
            </template>

            <template v-else>
              <button v-for="option in currentQuestion.options" :key="option._id" @click="toggleOption(option._id)" :disabled="isAnswered"
                :class="['w-full p-6 rounded-[1.5rem] border-2 text-left transition-all flex items-center justify-between group',
                  isSelected(option._id) ? 'border-[#423B71] bg-[#423B71] text-white shadow-xl translate-x-2' : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200',
                  isAnswered && option.isCorrect ? 'bg-green-500 border-green-500 text-white' : '',
                  isAnswered && isSelected(option._id) && !option.isCorrect ? 'bg-red-500 border-red-500 text-white' : '',
                  isAnswered && !isSelected(option._id) ? 'opacity-30' : '']">
                <div class="flex items-center gap-4">
                  <div v-if="currentQuestion.type === 'multiple-choice'" class="w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-colors"
                       :class="isSelected(option._id) ? 'bg-white border-white' : 'border-gray-300 group-hover:border-gray-400'">
                    <i v-if="isSelected(option._id)" class="fas fa-check text-[#423B71] text-[10px]"></i>
                  </div>
                  <span class="text-lg font-bold">{{ option.text }}</span>
                </div>
                <div v-if="isAnswered && option.isCorrect" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                  <i class="fas fa-check text-white"></i>
                </div>
              </button>
            </template>
          </div>

          <div v-if="isAnswered && (currentQuestion.explanation || currentQuestion.explanationPdfUrl)" 
               class="p-8 rounded-[2rem] bg-[#DCD8F4]/30 border-2 border-[#DCD8F4] animate-in slide-in-from-bottom duration-700">
            <div class="flex items-start gap-5">
               <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#8A79E2] shrink-0 shadow-sm"><i class="fas fa-lightbulb text-xl"></i></div>
               <div>
                  <p v-if="currentQuestion.explanation" class="text-[#423B71] font-medium leading-relaxed italic">" {{ currentQuestion.explanation }} "</p>
                  <a v-if="currentQuestion.explanationPdfUrl" :href="currentQuestion.explanationPdfUrl" target="_blank" 
                     class="mt-5 inline-flex items-center text-xs font-black uppercase tracking-widest text-[#8A79E2] hover:underline">
                    <i class="fas fa-file-pdf mr-2"></i> Voir le schéma explicatif
                  </a>
               </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentStep === 'result'" class="text-center space-y-12 py-10 animate-in zoom-in duration-700 max-w-md mx-auto">
          <div v-if="score >= (quiz?.minScoreToPass || 0)">
            <div class="text-9xl mb-8 transform hover:scale-110 transition-transform cursor-default">🏆</div>
            <h2 class="text-6xl font-black text-green-500 tracking-tighter">GAGNÉ !</h2>
            <p class="text-gray-400 font-bold text-lg">Votre progression a été enregistrée.</p>
          </div>
          <div v-else>
            <div class="text-9xl mb-8 grayscale transform hover:scale-110 transition-transform">🎯</div>
            <h2 class="text-6xl font-black text-red-400 tracking-tighter">OUPS...</h2>
            <p class="text-gray-400 font-bold text-lg">Il vous manquait quelques points.</p>
          </div>

          <div class="relative inline-block">
            <div class="absolute inset-0 bg-gray-100 rounded-[3.5rem] rotate-3 translate-y-2"></div>
            <div class="relative p-12 rounded-[3.5rem] bg-white border-4 border-gray-50 shadow-2xl">
               <div class="text-[10px] uppercase font-black text-gray-300 tracking-[0.3em] mb-3">Score Final</div>
               <div class="text-8xl font-black text-[#423B71]">{{ score }} <span class="text-2xl text-gray-200">/ {{ totalPossiblePoints }}</span></div>
            </div>
          </div>

          <div v-if="quiz?.explanationPdfUrl" class="px-6">
            <a :href="quiz.explanationPdfUrl" target="_blank" class="flex items-center justify-center gap-4 p-5 bg-[#B2E9E1] text-[#423B71] font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-[#FF8B7D] hover:text-white transition-all shadow-xl">
              <i class="fas fa-file-download text-xl"></i> Télécharger la correction
            </a>
          </div>
        </div>
      </main>

      <footer class="p-8 bg-gray-50 border-t flex justify-center flex-shrink-0 z-10">
        <button v-if="currentStep === 'questions' && !isAnswered" @click="handleAnswer" :disabled="currentQuestion.type !== 'ordering' && selectedAnswers.length === 0"
                class="w-full max-w-sm py-5 bg-[#423B71] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl disabled:opacity-20 transition-all hover:scale-105 active:scale-95">
          Valider ma réponse
        </button>

        <button v-if="currentStep === 'questions' && isAnswered" @click="nextStep"
                class="w-full max-w-sm py-5 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-[#FF8B7D] hover:text-white transition-all animate-pulse">
          {{ (currentIndex === quiz.questions.length - 1) ? 'Résultats finaux' : 'Question Suivante' }}
        </button>

        <button v-if="currentStep === 'result' || (!quiz && !isLoading)" @click="emit('close')"
                class="w-full max-w-sm py-5 bg-gray-200 text-[#423B71] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-300 transition-all">
          Retour au module
        </button>
      </footer>
    </div>

    <CreateIncidentModal :showModal="isIncidentModalOpen" @close="isIncidentModalOpen = false" @submit="handleIncidentSubmit" />
  </div>
</template>

<style scoped>
/* Scrollbar épurée */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { @apply bg-gray-200 rounded-full; }

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
}
</style>