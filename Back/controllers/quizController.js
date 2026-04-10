// backend/controllers/quizController.js
import Quiz from '../models/Quiz.js';
import Chapter from '../models/Chapter.js'; // Import du modèle Chapter
// Assurez-vous d'importer le modèle User si vous en avez besoin ici pour 'createdBy' ou d'autres logiques
// import User from '../models/User.js';


const calculateTotalScore = (questions) => {
    return questions.reduce((total, question) => total + (question.points || 0), 0);
};

/**
 * @desc    Crée un nouveau quiz et le lie à un chapitre
 * @route   POST /api/quizzes
 * @access  Private (Instructor, Admin)
 */
 export const createQuiz = async (req, res) => {
    try {
        // Déstructuration des champs attendus par le modèle Quiz, avec des valeurs par défaut si besoin
        const {
            title,
            description,
            formation,
            chapter,
            questions = [], // S'assurer que questions est un tableau vide si non fourni
            allowedErrors,
            errorScope,
            isBlocking,
            timeLimit,    // Ajouter si ces champs sont pertinents et attendus par le modèle Quiz
            passingScore  // Ajouter si ces champs sont pertinents et attendus par le modèle Quiz
        } = req.body;

        const totalPossibleScore = calculateTotalScore(questions);

        // Validation des IDs de formation et chapitre
        if (!formation || !chapter) {
            return res.status(400).json({ message: "Les IDs de la formation et du chapitre sont requis." });
        }

        // Création de l'instance du Quiz
        const newQuiz = new Quiz({
            title,
            description,
            formation,
            chapter,
            questions, // Utilise le tableau questions potentiellement vide
            allowedErrors,
            errorScope,
            isBlocking,
            timeLimit,
            totalPossibleScore,
            passingScore,
            createdBy: req.user.id // Utilise l'ID de l'utilisateur authentifié
        });
        const savedQuiz = await newQuiz.save(); // Sauvegarde du quiz

        // Trouver le chapitre parent pour y ajouter la référence du quiz
        const parentChapter = await Chapter.findById(chapter);
        if (!parentChapter) {
            // Si le chapitre parent n'existe pas, supprime le quiz créé et renvoie une erreur
            await Quiz.findByIdAndDelete(savedQuiz._id);
            return res.status(404).json({ message: "Chapitre parent non trouvé pour lier le quiz." });
        }

        // Déterminer l'ordre du nouveau contenu (quiz) à la fin de la liste existante
        const newContentOrder = parentChapter.contents.length;

        parentChapter.contents.push(savedQuiz._id);
        await parentChapter.save();

        res.status(201).json(savedQuiz); // Succès : renvoie le quiz créé
    } catch (error) {
        console.error("Erreur dans createQuiz (quizController):", error);
        res.status(400).json({ message: "Erreur lors de la création du quiz", error: error.message });
    }
};

// backend/controllers/quizController.js
export const getQuizById = async (req, res) => {
    try {
        // On teste quizId (route) ou id (fallback)
        const id = req.params.quizId || req.params.id;
        const quiz = await Quiz.findById(id);
        
        if (!quiz) {
            console.log("Quiz non trouvé en base pour l'ID:", id);
            return res.status(404).json({ message: "Quiz non trouvé en base" });
        }

        res.status(200).json(quiz); 
    } catch (error) {
        console.error("Erreur serveur getQuizById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

/**
 * @desc    Met à jour un quiz
 * @route   PUT /api/quizzes/:quizId
 * @access  Private (Instructor, Admin)
 */
export const updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const updateData = req.body;

        if (updateData.questions && Array.isArray(updateData.questions)) {
             updateData.totalPossibleScore = calculateTotalScore(updateData.questions);
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedQuiz) {
            return res.status(404).json({ message: "Quiz non trouvé" });
        }

        res.status(200).json(updatedQuiz);
    } catch (error) {
        console.error("Erreur dans updateQuiz:", error);
        res.status(400).json({ message: "Erreur lors de la mise à jour du quiz", error: error.message });
    }
};


/**
 * @desc    Supprime un quiz
 * @route   DELETE /api/quizzes/:quizId
 * @access  Private (Instructor, Admin)
 */
export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz non trouvé" });
        }

        await Chapter.findByIdAndUpdate(quiz.chapter, {
            $pull: { contents: quiz._id }
        });

        await quiz.deleteOne(); // Supprime le document quiz lui-même
        res.status(200).json({ message: "Quiz supprimé avec succès" });
    } catch (error) {
        console.error("Erreur dans deleteQuiz:", error); // Ajout d'un log d'erreur
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const cleanQuizForStudent = (quiz) => {
    const studentQuiz = JSON.parse(JSON.stringify(quiz)); 

    studentQuiz.questions = studentQuiz.questions.map(question => {
        // On retire les réponses
        if (question.options) {
            question.options = question.options.map(({ isCorrect, ...rest }) => rest);
        }
        if (question.imageOptions) {
            question.imageOptions = question.imageOptions.map(({ isCorrect, ...rest }) => rest);
        }
        
        // ON RETIRE L'EXPLICATION (très important pour éviter la triche)
        delete question.explanation; 

        return question;
    });

    return studentQuiz;
};