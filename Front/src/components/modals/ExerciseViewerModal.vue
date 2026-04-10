<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import api from '/services/api'; 
import { useProgressionStore } from '../../stores/progressionStore';

const props = defineProps<{
  show: boolean;
  exerciseId: string;
  sessionId: string;
  chapterId: string; 
}>();

const emit = defineEmits(['close', 'on-complete']);
const progressionStore = useProgressionStore();

const exercise = ref<any>(null);
const answers = ref<Record<string, { text?: string; file?: File | null }>>({});
const isLoading = ref(true);
const timeLeft = ref(0);
let timer: NodeJS.Timeout;
const currentQuestionIndex = ref(0);
const error = ref<string | null>(null);

const timeFormatted = computed(() => {
    if (!exercise.value || !exercise.value.timeLimit) return 'Temps illimité';
    const minutes = Math.floor(timeLeft.value / 60);
    const seconds = timeLeft.value % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const currentQuestion = computed(() => {
    if (!exercise.value?.questions) return null;
    return exercise.value.questions[currentQuestionIndex.value];
});

const isLastQuestion = computed(() => {
    if (!exercise.value?.questions) return false;
    return currentQuestionIndex.value === exercise.value.questions.length - 1;
});

const isNextButtonVisible = computed(() => {
    if (!currentQuestion.value) return false;
    const currentAnswer = answers.value[currentQuestion.value._id];
    return currentAnswer?.text && currentAnswer.text.trim().length > 0;
});


const prepareAndLoadExercise = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        await progressionStore.getOrInitializeActivityProgression(props.sessionId, props.chapterId);
        const response = await api.get(`/api/exercises/${props.exerciseId}`);
        exercise.value = response.data;

        if (!exercise.value || !exercise.value.questions) {
            throw new Error("Les données de l'exercice sont invalides.");
        }
        
        exercise.value.questions.forEach((q: any) => {
            answers.value[q._id] = { text: '' };
        });

        // --- MODIFICATION 3 : Initialisation du minuteur ---
        if (exercise.value.timeLimit > 0) {
            timeLeft.value = exercise.value.timeLimit * 60; // Convertir les minutes en secondes
            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    clearInterval(timer);
                    alert("Temps écoulé ! L'exercice va être soumis.");
                    submitExercise();
                }
            }, 1000);
        }
        // --------------------------------------------------

    } catch (err: any) {
        console.error("Error in prepareAndLoadExercise:", err);
        error.value = "Impossible de charger l'exercice. Veuillez réessayer.";
    } finally {
        isLoading.value = false;
    }
};

const goToNextQuestion = () => {
    if (!isLastQuestion.value) {
        currentQuestionIndex.value++;
    }
};

const goToPreviousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    }
};

const submitExercise = async () => {
    if (isLoading.value) return;
    
    // --- MODIFICATION 3bis : Arrêter le minuteur à la soumission ---
    clearInterval(timer);
    isLoading.value = true;

    try {
        const formattedAnswers = Object.keys(answers.value).map(questionId => ({
            questionId: questionId,
            responseText: answers.value[questionId].text
        }));

        const payload = {
            sessionId: props.sessionId,
            answers: formattedAnswers
        };
        
        await api.post(`/api/exercises/${props.exerciseId}/submit`, payload);
        
        emit('on-complete'); 
        emit('close');

    } catch (error: any) {
        alert(error.response?.data?.message || "Une erreur est survenue lors de la soumission.");
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.show, (newVal) => {
    if (newVal && props.exerciseId) {
        prepareAndLoadExercise();
    } else {
        clearInterval(timer);
        currentQuestionIndex.value = 0;
        exercise.value = null;
    }
}, { immediate: true });

onUnmounted(() => {
    clearInterval(timer);
});

</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div v-if="isLoading" class="text-white text-lg">Chargement de l'exercice...</div>
    <div v-else-if="error" class="bg-white rounded-lg p-6 text-center">
        <h3 class="text-xl font-bold text-red-500">Erreur</h3>
        <p class="my-4">{{ error }}</p>
        <button @click="$emit('close')" class="btn-secondary">Fermer</button>
    </div>
    <div v-else-if="exercise && currentQuestion" class="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
      <header class="flex justify-between items-center p-4 border-b">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">{{ exercise.title }}</h3>
          <p class="text-sm text-gray-500">Question {{ currentQuestionIndex + 1 }} sur {{ exercise.questions.length }}</p>
        </div>
        <div class="font-mono text-lg bg-gray-100 px-4 py-1 rounded-md">{{ timeFormatted }}</div>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
      </header>
      
      <main class="flex-1 overflow-y-auto p-6 flex flex-col">
        <div class="flex-grow">
          <label class="font-semibold text-gray-700 text-xl block mb-4">{{ currentQuestion.questionText }}</label>
          
          <img 
            v-if="currentQuestion.imageUrl" 
            :src="currentQuestion.imageUrl" 
            alt="Image de la question"
            class="my-4 rounded-md max-w-full h-auto mx-auto"
          />
          <div v-if="exercise.submissionType === 'text'" class="h-full">
            <textarea
              v-model="answers[currentQuestion._id].text"
              class="w-full h-full p-4 border rounded-md focus:ring-2 focus:ring-[#876EC8] text-lg"
              placeholder="Rédigez votre réponse ici..."
              :disabled="isLoading"
              :style="{ minHeight: '250px' }" ></textarea>
          </div>
        </div>
      </main>

      <footer class="p-4 border-t flex justify-between items-center">
        <button 
            @click="goToPreviousQuestion"
            v-if="currentQuestionIndex > 0"
            class="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          &larr; Précédent
        </button>
        <div v-else></div> 
        <button 
            v-if="!isLastQuestion && isNextButtonVisible"
            @click="goToNextQuestion"
            class="bg-[#876EC8] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[#6a52a1] transition-colors"
        >
          Suivant &rarr;
        </button>
        
        <button 
            v-if="isLastQuestion && isNextButtonVisible"
            @click="submitExercise" 
            :disabled="isLoading"
            class="bg-teal-500 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-teal-600 disabled:bg-gray-400 transition-colors"
        >
          {{ isLoading ? 'Envoi en cours...' : 'Envoyer pour correction' }}
        </button>
      </footer>
    </div>
  </div>
</template>