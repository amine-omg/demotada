import Exercise from '../models/Exercise.js';
import Chapter from '../models/Chapter.js';
import ExerciseAttempt from '../models/ExerciseAttempt.js'; 

// Créer un nouvel exercice
export const createExercise = async (req, res) => {
    try {
        const { title, formation, chapter } = req.body;
        if (!title || !formation || !chapter) {
            return res.status(400).json({ message: "Titre, formation et chapitre sont requis." });
        }

        const newExercise = new Exercise({ ...req.body, createdBy: req.user._id });
        const savedExercise = await newExercise.save();

        await Chapter.findByIdAndUpdate(chapter, { $push: { contents: savedExercise._id } });

        res.status(201).json(savedExercise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de l'exercice", error: error.message });
    }
};

// Obtenir un exercice par ID
export const getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) return res.status(404).json({ message: "Exercice non trouvé" });
        res.status(200).json(exercise);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Mettre à jour un exercice
export const updateExercise = async (req, res) => {
    try {
        const updatedExercise = await Exercise.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!updatedExercise) return res.status(404).json({ message: "Exercice non trouvé" });
        res.status(200).json(updatedExercise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

// Supprimer un exercice
export const deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) return res.status(404).json({ message: "Exercice non trouvé" });
        
        await Chapter.findByIdAndUpdate(exercise.chapter, { $pull: { contents: exercise._id } });
        await exercise.deleteOne();
        
        res.status(200).json({ message: "Exercice supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const submitExercise = async (req, res) => {
    try {
        const { exerciseId } = req.params;
        const { sessionId, answers } = req.body; // Le frontend doit envoyer l'ID de la session et les réponses
        const studentId = req.user.id;

        // Validation des données reçues
        if (!sessionId || !answers) {
            return res.status(400).json({ message: "L'ID de la session et les réponses sont requis." });
        }

        // Vérifier que l'exercice existe
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            return res.status(404).json({ message: "Exercice non trouvé." });
        }

        // Vérifier si une soumission existe déjà pour éviter les doublons
        const existingAttempt = await ExerciseAttempt.findOne({ exerciseId, studentId, sessionId });
        if (existingAttempt) {
            return res.status(409).json({ message: "Vous avez déjà soumis des réponses pour cet exercice." });
        }

        // Créer la nouvelle soumission
        const newAttempt = new ExerciseAttempt({
            exerciseId,
            studentId,
            sessionId,
            answers, // Le format des réponses vient directement du frontend
            status: 'soumis' // C'est votre statut "en attente de correction"
        });

        await newAttempt.save();

        res.status(201).json({ message: "Exercice soumis avec succès.", attempt: newAttempt });

    } catch (error) {
        console.error("Erreur dans submitExercise:", error);
        res.status(500).json({ message: "Erreur serveur lors de la soumission de l'exercice.", error: error.message });
    }
};


export const addQuestionToExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.exerciseId);
        if (!exercise) return res.status(404).json({ message: "Exercice non trouvé" });

        // On vérifie la limite de 25 questions
        if (exercise.questions.length >= 25) {
            return res.status(400).json({ message: "Le nombre maximum de 25 questions par exercice est atteint." });
        }

        const newQuestion = { ...req.body, order: exercise.questions.length };
        exercise.questions.push(newQuestion);
        await exercise.save();
        res.status(201).json(exercise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout de la question", error: error.message });
    }
};

export const updateQuestionInExercise = async (req, res) => {
    try {
        const { exerciseId, questionId } = req.params;
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) return res.status(404).json({ message: "Exercice non trouvé" });

        const question = exercise.questions.id(questionId);
        if (!question) return res.status(404).json({ message: "Question non trouvée" });

        // Met à jour les champs de la question
        Object.assign(question, req.body);
        await exercise.save();
        res.status(200).json(exercise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour de la question", error: error.message });
    }
};

export const deleteQuestionFromExercise = async (req, res) => {
    try {
        const { exerciseId, questionId } = req.params;
        await Exercise.findByIdAndUpdate(exerciseId, {
            $pull: { questions: { _id: questionId } }
        });
        res.status(200).json({ message: "Question supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la question", error: error.message });
    }
};