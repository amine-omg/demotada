<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '/services/api';
import draggable from 'vuedraggable';

const props = defineProps<{
  show: boolean;
  formationId: string;
  evaluationType: string;
  evaluationData: any;
}>();

const emit = defineEmits(['close', 'on-complete']);

// --- ÉTATS ---
const currentStep = ref<'intro' | 'questions' | 'result'>('intro');
const currentIndex = ref(0);
const isSaving = ref(false);
const isAnswered = ref(false);
const score = ref(0);
const selectedAnswers = ref<string[]>([]);
const orderedItems = ref<any[]>([]);
const userAnswers = ref<any[]>([]);

// --- SÉCURITÉ ET DATA ---
const currentQuestion = computed(() => {
  if (!props.evaluationData?.questions?.[currentIndex.value]) return null;
  return props.evaluationData.questions[currentIndex.value];
});

const progress = computed(() => {
  if (!props.evaluationData?.questions) return 0;
  return ((currentIndex.value) / props.evaluationData.questions.length) * 100;
});

// --- UTILITAIRES ---
const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Sécurité : on utilise l'ID s'il existe, sinon le texte de l'option
const getOptionId = (option: any) => option._id || option.text;

const isSelected = (option: any) => selectedAnswers.value.includes(getOptionId(option));

const toggleOption = (option: any) => {
  if (isAnswered.value) return;
  const id = getOptionId(option);

  if (currentQuestion.value.type === 'single-choice' || currentQuestion.value.type === 'true-false') {
    selectedAnswers.value = [id];
  } else if (currentQuestion.value.type === 'multiple-choice') {
    const index = selectedAnswers.value.indexOf(id);
    if (index > -1) {
      selectedAnswers.value.splice(index, 1);
    } else {
      selectedAnswers.value.push(id);
    }
  }
};

// --- LOGIQUE VISUELLE (Fix du glitch) ---
const getOptionClass = (option: any) => {
  const selected = isSelected(option);
  
  // ÉTAT 1 : Avant validation (Sélection en cours)
  if (!isAnswered.value) {
    return selected 
      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md ring-2 ring-indigo-200' 
      : 'border-gray-200 bg-white hover:border-indigo-300 text-gray-700';
  }

  // ÉTAT 2 : Après validation (Affichage des résultats)
  if (option.isCorrect) {
    return 'bg-green-50 border-green-400 text-green-800 shadow-sm';
  }
  if (selected && !option.isCorrect) {
    return 'bg-red-50 border-red-400 text-red-800 shadow-sm';
  }
  return 'opacity-40 border-gray-100 bg-gray-50 text-gray-300 grayscale-[0.5]';
};

// --- LOGIQUE DE RÉPONSE ---
const handleAnswer = () => {
  if (currentQuestion.value.type !== 'ordering' && selectedAnswers.value.length === 0) return;
  
  isAnswered.value = true;
  const question = currentQuestion.value;
  let isCorrect = false;
  let answerValue: any = null;

  if (['single-choice', 'multiple-choice', 'true-false'].includes(question.type)) {
    const correctOptionIds = question.options.filter((o: any) => o.isCorrect).map((o: any) => getOptionId(o));
    
    if (question.type === 'multiple-choice') {
      isCorrect = correctOptionIds.length === selectedAnswers.value.length && 
                  correctOptionIds.every((id: string) => selectedAnswers.value.includes(id));
      answerValue = question.options.filter((o: any) => selectedAnswers.value.includes(getOptionId(o))).map((o: any) => o.text);
    } else {
      isCorrect = correctOptionIds.includes(selectedAnswers.value[0]);
      const selectedOpt = question.options.find((o: any) => getOptionId(o) === selectedAnswers.value[0]);
      answerValue = selectedOpt?.text;
    }
  } else if (question.type === 'ordering') {
    isCorrect = orderedItems.value.every((item, index) => item.order === index + 1);
    answerValue = orderedItems.value.map(i => i.text);
  }

  const earnedPoints = isCorrect ? (question.points || 1) : 0;
  score.value += earnedPoints;

  userAnswers.value.push({
    questionId: question._id || `q-${currentIndex.value}`,
    category: question.category || 'Général',
    value: answerValue,
    isCorrect,
    points: earnedPoints
  });
};

const nextStep = async () => {
  if (currentIndex.value < props.evaluationData.questions.length - 1) {
    currentIndex.value++;
    selectedAnswers.value = []; 
    isAnswered.value = false;
    if (currentQuestion.value?.type === 'ordering') {
      orderedItems.value = shuffleArray(currentQuestion.value.orderingElements);
    }
  } else {
    isSaving.value = true;
    try {
      await api.post(`/api/user-evaluations/save`, {
        formationId: props.formationId,
        evaluationType: props.evaluationType,
        responses: userAnswers.value
      });
      currentStep.value = 'result';
      emit('on-complete', score.value);
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      isSaving.value = false;
    }
  }
};

onMounted(() => {
  if (currentQuestion.value?.type === 'ordering') {
    orderedItems.value = shuffleArray(currentQuestion.value.orderingElements);
  }
});
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden font-sans">
    
    <header class="h-16 flex items-center justify-between px-6 md:px-10 border-b border-gray-100 flex-shrink-0 bg-white">
      <div class="font-black text-[#423B71] text-lg uppercase tracking-widest flex items-center gap-3">
        <i class="fas fa-clipboard-check text-indigo-500"></i>
        {{ evaluationData?.title || 'Évaluation' }}
      </div>
      <div class="text-sm font-bold text-gray-400">
        <span v-if="currentStep === 'questions'">Question {{ currentIndex + 1 }} / {{ evaluationData?.questions?.length }}</span>
        <span v-else-if="currentStep === 'result'" class="text-green-500 font-black"><i class="fas fa-check-circle mr-1"></i> TEST TERMINÉ</span>
      </div>
    </header>
    
    <div v-if="currentStep === 'questions'" class="h-1.5 w-full bg-gray-50 flex-shrink-0">
      <div class="h-full bg-indigo-500 transition-all duration-500 ease-out" :style="{ width: progress + '%' }"></div>
    </div>

    <main class="flex-grow overflow-y-auto p-6 md:p-12 flex flex-col items-center">
      <div class="w-full max-w-3xl my-auto">

        <div v-if="currentStep === 'intro'" class="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div class="inline-flex w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full items-center justify-center text-4xl shadow-inner mb-2">
            <i class="fas fa-rocket"></i>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-[#423B71] leading-tight">Test de Positionnement</h1>
          <p class="text-lg text-gray-500 font-medium">Cette étape nous permet d'adapter la formation à votre niveau actuel. Prenez le temps de bien lire les questions.</p>
          <button @click="currentStep = 'questions'" class="px-12 py-5 bg-[#423B71] text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest">Démarrer</button>
        </div>

        <div v-else-if="currentStep === 'questions' && currentQuestion" class="space-y-8 animate-in slide-in-from-right duration-300 pb-32">
          
          <div class="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-widest">
            {{ currentQuestion.category || 'Général' }}
          </div>

          <h2 class="text-2xl md:text-3xl font-black text-[#423B71] leading-snug whitespace-pre-line">
            {{ currentQuestion.text }}
          </h2>

          <div v-if="currentQuestion.imageUrl" class="my-6 rounded-3xl overflow-hidden border-2 border-gray-100 shadow-sm bg-white p-2">
           <img :src="currentQuestion.imageUrl" class="w-full h-auto max-h-72 object-contain rounded-2xl" />
          </div>

          <div class="space-y-4">
            <template v-if="currentQuestion.type === 'ordering'">
              <draggable v-model="orderedItems" item-key="_id" :disabled="isAnswered" ghost-class="opacity-40" class="space-y-3">
                <template #item="{ element, index }">
                  <div :class="[
                      'w-full p-5 rounded-2xl border-2 font-bold transition-all duration-200 flex items-center justify-between text-lg shadow-sm',
                      !isAnswered ? 'border-gray-200 bg-white cursor-move' : '',
                      isAnswered && element.order === index + 1 ? 'bg-green-50 border-green-400 text-green-800' : '',
                      isAnswered && element.order !== index + 1 ? 'bg-red-50 border-red-400 text-red-800' : ''
                    ]">
                    <div class="flex items-center gap-5">
                      <span class="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center text-sm shadow-inner">{{ index + 1 }}</span>
                      <span>{{ element.text }}</span>
                    </div>
                    <i class="fas fa-grip-lines text-gray-300"></i>
                  </div>
                </template>
              </draggable>
            </template>

            <template v-else>
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="option._id || index"
                @click="toggleOption(option)"
                :disabled="isAnswered"
                :class="[
                  'w-full p-6 rounded-2xl border-2 text-left font-bold transition-all duration-300 flex items-center justify-between text-lg',
                  getOptionClass(option)
                ]"
              >
                <div class="flex items-center gap-4">
                  <i v-if="currentQuestion.type === 'multiple-choice'" :class="['text-2xl', isSelected(option) ? 'fas fa-check-square text-indigo-500' : 'far fa-square text-gray-300']"></i>
                  <span>{{ option.text }}</span>
                </div>
                <div v-if="isAnswered && option.isCorrect" class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md animate-bounce">
                  <i class="fas fa-check"></i>
                </div>
              </button>
            </template>
          </div>

          <div v-if="isAnswered && currentQuestion.explanation" class="mt-8 p-6 rounded-2xl bg-blue-50 border border-blue-100 animate-in slide-in-from-bottom duration-500">
            <h4 class="text-blue-800 font-black uppercase tracking-widest text-xs mb-2"><i class="fas fa-lightbulb mr-2"></i>Explication</h4>
            <p class="text-blue-900 font-medium leading-relaxed">{{ currentQuestion.explanation }}</p>
          </div>
        </div>

        <div v-else-if="currentStep === 'result'" class="text-center space-y-10 py-10 animate-in zoom-in duration-500">
          <div class="inline-flex w-32 h-32 bg-green-50 text-green-500 rounded-full items-center justify-center text-6xl shadow-inner mb-4">
            <i class="fas fa-check-double"></i>
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-[#423B71]">Résultats enregistrés !</h2>
          <p class="text-xl text-gray-500 font-medium max-w-lg mx-auto">Vous avez complété le test de positionnement avec succès. Vous pouvez maintenant rejoindre votre session de formation.</p>
          <button @click="$emit('close')" class="px-16 py-5 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black text-lg shadow-xl hover:bg-[#9addd3] transition-all uppercase tracking-widest">Entrer dans la classe</button>
        </div>

      </div>
    </main>

    <footer v-if="currentStep === 'questions'" class="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[110]">
      <div class="max-w-3xl mx-auto flex justify-end">
        <button 
          v-if="!isAnswered"
          @click="handleAnswer"
          :disabled="currentQuestion?.type !== 'ordering' && selectedAnswers.length === 0"
          class="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black tracking-widest shadow-xl disabled:opacity-30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center uppercase"
        >
          Valider la réponse <i class="fas fa-check ml-3"></i>
        </button>

        <button 
          v-if="isAnswered"
          @click="nextStep"
          :disabled="isSaving"
          class="px-12 py-4 bg-[#423B71] text-white rounded-2xl font-black tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center uppercase"
        >
          <i v-if="isSaving" class="fas fa-circle-notch fa-spin mr-3"></i>
          {{ isSaving ? 'Sauvegarde...' : (currentIndex === evaluationData.questions.length - 1 ? 'Terminer' : 'Suivant') }}
          <i v-if="!isSaving" class="fas fa-arrow-right ml-3"></i>
        </button>
      </div>
    </footer>

  </div>
</template>