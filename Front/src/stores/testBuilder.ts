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
    type: 'single-choice' | 'multiple-choice' | 'true-false' | 'image-qcm' | 'ordering' | 'fill-in-the-blanks' | 'rating';
    points: number;
    category?: string; // <--- NOUVEAU : Pour l'analyse thématique
    explanation?: string;
    options?: Option[]; 
    imageOptions?: ImageOption[]; 
    orderingElements?: OrderingElement[]; 
    blankOptions?: BlankOption[]; 
    blankTextContent?: string; 
}

interface TestSettings {
    timer: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    minScoreToPass: number;
}

interface TestState {
    _id: string | null;
    title: string;
    description: string;
    formation: string | null; 
    questions: Question[];
    settings: TestSettings;
    explanationPdfUrl: string;
    isLoading: boolean;
    error: string | null; // <--- Ajouté pour la cohérence
}

const initialTestState = (): TestState => ({
    _id: null,
    title: 'Test de Positionnement',
    description: '',
    formation: null, 
    questions: [],
    settings: {
        timer: 0,
        shuffleQuestions: false,
        showCorrectAnswers: true,
        minScoreToPass: 0
    },
    explanationPdfUrl: '',
    isLoading: false,
    error: null,
});

export const useTestBuilderStore = defineStore('testBuilder', {
    state: (): { test: TestState } => ({
        test: initialTestState() // Utilisation de la fonction pour l'état initial
    }),

    actions: {
        resetTestState() {
            this.test = initialTestState();
        },

        async loadTest(formationId: string) {
            this.test.isLoading = true;
            this.test.error = null;
            this.test.formation = formationId;

            try {
                // Route spécifique pour récupérer le test de positionnement d'une formation
                const response = await api.get(`/api/formations/${formationId}/positioning-test`);
                if (response.data) {
                    this.test = { 
                        ...initialTestState(), 
                        ...response.data, 
                        formation: formationId 
                    };
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    console.log("Aucun test existant, prêt pour la création.");
                } else {
                    this.test.error = "Erreur lors du chargement du test.";
                    console.error('Erreur loadTest:', err);
                }
            } finally {
                this.test.isLoading = false;
            }
        },

async fetchTest(formationId: string, type: string = 'positioning') {
            this.test.isLoading = true;
            try {
                // CORRECTION : L'URL matche exactement evaluationRoutes.js
                const response = await api.get(`/api/evaluations/${formationId}/evaluation/${type}`);
                const testData = response.data;
                
                // Le backend renvoie directement le test (grâce à ton evaluationController.js)
                if (testData && testData.questions) {
                    this.test = { 
                        ...this.test, 
                        ...testData, 
                        questions: testData.questions || [],
                        settings: testData.settings || this.test.settings
                    };
                } else {
                    this.resetTest(formationId);
                }
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    console.log("Aucune évaluation existante pour ce type, prêt pour la création.");
                    this.resetTest(formationId); // On initialise un test vide proprement
                } else {
                    console.error("Erreur fetchTest:", error);
                }
            } finally {
                this.test.isLoading = false;
            }
        },

        async saveTest(formationId: string, type: string = 'positioning') {
            this.test.isLoading = true;
            try {
                const payload = {
                    ...this.test,
                    type: type 
                };
                // CORRECTION : L'URL matche exactement evaluationRoutes.js
                await api.post(`/api/evaluations/${formationId}/evaluation`, payload);
            } catch (error) {
                console.error("Erreur saveTest:", error);
                throw error;
            } finally {
                this.test.isLoading = false;
            }
        },

       

        addQuestion(type: Question['type']) {
            const newQuestion: Question = {
                text: '',
                type: type as any,
                points: 1,
                category: '', // Initialisation de la catégorie
                options: [],
                imageOptions: [],
                orderingElements: [],
                blankOptions: []
            };

            if (type === 'single-choice' || type === 'multiple-choice') {
                newQuestion.options = [
                    { text: 'Option 1', isCorrect: true },
                    { text: 'Option 2', isCorrect: false }
                ];
            } else if (type === 'true-false') {
                newQuestion.options = [
                    { text: 'Vrai', isCorrect: true },
                    { text: 'Faux', isCorrect: false }
                ];
            } else if (type === 'image-qcm') {
                newQuestion.text = 'Sélectionnez les images correctes.';
                newQuestion.imageOptions = [
                    { imageUrl: '', isCorrect: true },
                    { imageUrl: '', isCorrect: false }
                ];
            } else if (type === 'ordering') {
                newQuestion.text = 'Remettez dans l\'ordre.';
                newQuestion.orderingElements = [
                    { text: 'Étape 1', order: 1 },
                    { text: 'Étape 2', order: 2 }
                ]; 
            } else if (type === 'rating') {
                newQuestion.text = "Comment évaluez-vous...";
                newQuestion.points = 5; // Par défaut sur 5 étoiles
            } else if (type === 'fill-in-the-blanks') {
                newQuestion.text = 'Complétez le texte.';
                newQuestion.blankTextContent = 'Le {chat} est sur la {table}.'; 
                newQuestion.blankOptions = [
                    { text: 'chat' },
                    { text: 'table' }
                ];
            }

            this.test.questions.push(newQuestion);
        },

        resetTest(formationId: string) {
            this.test = {
                _id: null,
                title: 'Nouveau Questionnaire',
                description: '',
                formation: formationId,
                questions: [],
                explanationPdfUrl: '',
                settings: { timer: 0, shuffleQuestions: false, showCorrectAnswers: true, minScoreToPass: 50 },
                isLoading: false
            };
        },

        removeQuestion(index: number) {
            this.test.questions.splice(index, 1);
        },

        updateQuestion(index: number, data: Question) {
            this.test.questions[index] = { ...data };
        }
    },
});