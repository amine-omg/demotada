// backend/controllers/lessonController.js
import Lesson from '../models/Lesson.js';
import Chapter from '../models/Chapter.js'; // Pour mettre à jour les chapitres

/**
 * @desc    Crée une nouvelle leçon
 * @route   POST /api/lessons
 * @access  Private (Instructor, Admin)
 */
export const createLesson = async (req, res) => {
    try {
        const { title, description, formation, chapter, blocks, order } = req.body;

        if (!formation || !chapter || !title) {
            return res.status(400).json({ message: "L'ID de la formation, du chapitre et le titre sont requis." });
        }

        const newLesson = new Lesson({
            title,
            description,
            formation,
            chapter,
            blocks: blocks || [], // Les blocs peuvent être vides au début
            order, // L'ordre sera géré par le frontend
            createdBy: req.user.id // L'utilisateur authentifié
        });

        const savedLesson = await newLesson.save();

        await Chapter.findByIdAndUpdate(chapter, {
            $push: { contents: savedLesson._id }
        });

        res.status(201).json(savedLesson);
    } catch (error) {
        console.error("Erreur dans createLesson:", error);
        res.status(400).json({ message: "Erreur lors de la création de la leçon", error: error.message });
    }
};

/**
 * @desc    Récupère une leçon par son ID
 * @route   GET /api/lessons/:id
 * @access  Private (Instructor, Admin)
 */
export const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: "Leçon non trouvée" });
        }
        res.status(200).json(lesson);
    } catch (error) {
        console.error("Erreur dans getLessonById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// backend/controllers/lessonController.js

export const updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // On prend toutes les données du formulaire, sans exception

        // findByIdAndUpdate va mettre à jour la leçon avec toutes les données fournies
        const updatedLesson = await Lesson.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedLesson) {
            return res.status(404).json({ message: "Leçon non trouvée" });
        }
        res.status(200).json(updatedLesson);

    } catch (error) {
        console.error("--- ERREUR BACKEND dans updateLesson ---:", error);
        res.status(400).json({ message: "Erreur lors de la mise à jour de la leçon", error: error.message });
    }
};

export const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: "Leçon non trouvée" });
        }
        
        await Chapter.findByIdAndUpdate(lesson.chapter, {
            $pull: { contents: lesson._id }
        });

        await lesson.deleteOne();
        
        res.status(200).json({ message: "Leçon supprimée avec succès" });
    } catch (error) {
        console.error("Erreur dans deleteLesson:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};