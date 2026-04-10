import { defineStore } from 'pinia';
import api from '/services/api'; 

interface Option {
    _id?: string;
    text: string;
    isCorrect: boolean;
}

interface ImageOption {
    _id?: string;
    imageUrl: string;
    isCorrect: boolean;
}

interface OrderingElement {
    _id?: string;
    text: string;
    order: number; 
}

interface BlankOption {
    _id?: string;
    text: string; 
}

interface Question {
    _id?: string;
    text: string; 
    type: 'single-choice' | 'multiple-choice' | 'true-false' | 'image-qcm' | 'ordering' | 'fill-in-the-blanks';
    points: number;

    options?: Option[]; 

    imageOptions?: ImageOption[]; 
    orderingElements?: OrderingElement[]; 
    blankOptions?: BlankOption[]; 
    blankTextContent?: string; 
}

interface QuizRules {
    hasAttemptLimit: boolean;
    maxAttempts: number;
    isHandicapImmune: boolean;
}

interface QuizState {
    _id: string | null;
    title: string;
    description: string;
    formation: string | null; 
    chapter: string | null; 
    questions: Question[];
    allowedErrors: number;
    errorScope: 'perQuestion' | 'total';
    timeLimit: number; 
    passingScore: number; 
    rules: QuizRules; 
    createdBy: string | null;
    isLoading: boolean;
    error: string | null;
   isBlocking: boolean;
}

const initialQuizState = (): QuizState => ({
    _id: null,
    title: '',
    description: '',
    formation: null, 
    chapter: null,
    questions: [],
    allowedErrors: 0,
    errorScope: 'total',
    timeLimit: 0,
    passingScore: 80,
    rules: {
        hasAttemptLimit: false,
        maxAttempts: 0,
        isHandicapImmune: true,
    },
    createdBy: null,
    isLoading: false,
    error: null,
    isBlocking: false,
});

export const useQuizBuilderStore = defineStore('quizBuilder', {
  state: () => ({
      quiz: initialQuizState(),
  }),

    actions: {
      resetQuizState() {
            this.quiz = initialQuizState();
        },
        async loadQuiz(quizId: string) {
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');

            try {
                const response = await api.get(`/api/quizzes/${quizId}`);
                this.quiz = { ...initialQuizState(), ...response.data }; 
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors du chargement du quiz.';
                console.error('Erreur loadQuiz:', err);
                this.resetQuizState();
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        async saveQuiz() {
            if (!this.quiz._id) {
                this.error = "Impossible de sauvegarder un quiz sans ID.";
                throw new Error("Quiz ID is missing.");
            }
            this.isLoading = true;
            this.error = null;
            const authToken = localStorage.getItem('authToken');

            try {
                const response = await api.put(
                    `/api/quizzes/${this.quiz._id}`,
                    this.quiz);
                this.quiz = { ...this.quiz, ...response.data }; 
                console.log("Quiz sauvegardé avec succès !");
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erreur lors de la sauvegarde du quiz.';
                console.error('Erreur saveQuiz:', err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        async uploadExplanationPdf(file: File) {
    // On réutilise la logique d'upload vers Cloudflare via ton API
    const formData = new FormData();
    formData.append('file', file);
    // ... appel axios vers ton endpoint d'upload
    // return response.data.url;
},

        addQuestion(type: 'single-choice' | 'multiple-choice' | 'true-false' | 'image-qcm' | 'ordering' | 'fill-in-the-blanks') {
            const newQuestion: Question = {
                text: 'Nouvelle question',
                type: type,
                points: 1,
                options: [],
                imageOptions: [],
                orderingElements: [],
                blankOptions: [],
                blankTextContent: '',
            };
            if (type === 'single-choice') {
                newQuestion.options = [
                    { text: 'Option 1 (Correcte)', isCorrect: true },
                    { text: 'Option 2', isCorrect: false },
                    { text: 'Option 3', isCorrect: false },
                ];
            } else if (type === 'multiple-choice') {
                newQuestion.options = [
                    { text: 'Option 1 (Correcte)', isCorrect: true },
                    { text: 'Option 2', isCorrect: false },
                    { text: 'Option 3', isCorrect: false },
                ];
            } else if (type === 'true-false') {
                newQuestion.options = [
                    { text: 'Vrai', isCorrect: true },
                    { text: 'Faux', isCorrect: false },
                ];
            } else if (type === 'image-qcm') {
                newQuestion.text = 'Choisissez les images correctes.';
                newQuestion.imageOptions = [
                    { imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Image+1', isCorrect: true },
                    { imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Image+2', isCorrect: false },
                    { imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Image+3', isCorrect: false },
                ];
            } else if (type === 'ordering') {
                newQuestion.text = 'Mettez les phrases dans le bon ordre.';
                newQuestion.orderingElements = [
                    { text: 'Première phrase', order: 1 },
                    { text: 'Deuxième phrase', order: 2 },
                    { text: 'Troisième phrase', order: 3 },
                ];
            } else if (type === 'fill-in-the-blanks') {
                newQuestion.text = 'Complétez le texte avec les mots manquants.';
                newQuestion.blankTextContent = 'Le {chat} est un animal {domestique}.'; 
                newQuestion.blankOptions = [
                    { text: 'chat' },
                    { text: 'domestique' },
                    { text: 'oiseau' }, 
                ];
            }

            this.quiz.questions.push(newQuestion);
        },
    },
});
