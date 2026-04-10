<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import api from '/services/api';

const props = defineProps<{
  show: boolean;
  quizId: string;
  sessionId: string;
}>();

const emit = defineEmits(['close', 'on-complete']);

const quiz = ref<any>(null);
const currentQuestionIndex = ref(0);
const studentAnswers = ref<any[]>([]);
const timeLeft = ref(0);
let timer: NodeJS.Timeout;

const currentQuestion = computed(() => quiz.value?.questions[currentQuestionIndex.value]);

onMounted(async () => {
    const response = await api.get(`/api/quizzes/${props.quizId}`);
    quiz.value = response.data;
    
    // Initialiser les réponses
    quiz.value.questions.forEach((q: any) => {
        studentAnswers.value.push({ questionId: q._id, selectedOptionIds: [] });
    });

    if (quiz.value.timeLimit > 0) {
        timeLeft.value = quiz.value.timeLimit * 60;
        timer = setInterval(() => {
            if (timeLeft.value-- <= 0) {
                clearInterval(timer);
                submitQuiz();
            }
        }, 1000);
    }
});

onUnmounted(() => clearInterval(timer));

const selectOption = (questionId: string, optionId: string) => {
    const answer = studentAnswers.value.find(a => a.questionId === questionId);
    if (answer) {
        // Logique pour QCM à choix unique
        answer.selectedOptionIds = [optionId];
    }
};

const nextQuestion = () => {
    if (currentQuestionIndex.value < quiz.value.questions.length - 1) {
        currentQuestionIndex.value++;
    }
};

const submitQuiz = async () => {
    clearInterval(timer);
    try {
        // On appelle la route backend que vous avez déjà !
        await api.post(`/api/quizzes/${props.quizId}/attempts`, {
            answers: studentAnswers.value
        });
        
        // La soumission a réussi, on informe le système de progression
        emit('on-complete');

    } catch (error) {
        alert("Erreur lors de la soumission du quiz.");
        console.error(error);
    }
};
</script>

<template>
  <div v-if="show && quiz" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
       <header class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-800">{{ quiz.title }}</h3>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-800">&times;</button>
      </header>
      
      <main class="flex-1 overflow-y-auto p-6" v-if="currentQuestion">
        <p class="text-sm text-gray-500">Question {{ currentQuestionIndex + 1 }} / {{ quiz.questions.length }}</p>
        <h2 class="text-2xl font-semibold my-4">{{ currentQuestion.text }}</h2>
        
        <div class="space-y-3">
          <div v-for="option in currentQuestion.options" :key="option._id">
            <label
              class="flex items-center p-4 border rounded-lg cursor-pointer"
              :class="{ 'bg-indigo-100 border-indigo-400': studentAnswers[currentQuestionIndex].selectedOptionIds.includes(option._id) }"
            >
              <input 
                type="radio" 
                :name="`question-${currentQuestion._id}`"
                class="h-5 w-5"
                @change="selectOption(currentQuestion._id, option._id)"
              >
              <span class="ml-4 text-lg">{{ option.text }}</span>
            </label>
          </div>
        </div>
      </main>

      <footer class="p-4 border-t flex justify-end">
        <button v-if="currentQuestionIndex < quiz.questions.length - 1" @click="nextQuestion" class="bg-gray-800 text-white font-bold py-2 px-6 rounded-lg">
          Question suivante
        </button>
        <button v-else @click="submitQuiz" class="bg-green-500 text-white font-bold py-2 px-6 rounded-lg">
          Terminer le Quiz
        </button>
      </footer>
    </div>
  </div>
</template>