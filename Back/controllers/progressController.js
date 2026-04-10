import FormationProgress from '../models/FormationProgress.js';
import Chapter from '../models/Chapter.js'; // Pour calculer le total des blocs

/**
 * @desc    Récupère la progression d'un élève pour une formation
 * @route   GET /api/formations/:formationId/progress
 * @access  Private (Student)
 */
export const getFormationProgress = async (req, res) => {
    try {
        const { formationId } = req.params;
        const studentId = req.user._id;

        let progress = await FormationProgress.findOne({ formationId, studentId });

        if (!progress) {
            // Si aucune progression n'existe, on en crée une nouvelle
            progress = new FormationProgress({ formationId, studentId });
            await progress.save();
        }

        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

/**
 * @desc    Un élève valide un bloc de contenu
 * @route   PUT /api/progress/validate-block
 * @access  Private (Student)
 */
export const validateBlock = async (req, res) => {
    try {
        const { formationId, chapterId, contentId, blockId } = req.body;
        const studentId = req.user._id;

        let progress = await FormationProgress.findOne({ formationId, studentId });
        if (!progress) {
            progress = new FormationProgress({ formationId, studentId });
        }

        // Ajoute l'ID du bloc au tableau s'il n'y est pas déjà
        if (!progress.validatedBlocks.includes(blockId)) {
            progress.validatedBlocks.push(blockId);
        }

        // Recalculer le pourcentage de progression
        const chapters = await Chapter.find({ formation: formationId });
        let totalBlocks = 0;
        chapters.forEach(chap => {
            chap.contents.forEach(cont => {
                if (cont.blocks) totalBlocks += cont.blocks.length;
            });
        });

        if (totalBlocks > 0) {
            progress.progressPercentage = Math.round((progress.validatedBlocks.length / totalBlocks) * 100);
        } else {
            progress.progressPercentage = 0;
        }

        if (progress.progressPercentage === 100) {
            progress.completedAt = new Date();
        }

        await progress.save();

        res.status(200).json({ message: "Bloc validé avec succès", progress });

    } catch (error) {
        console.error("Erreur dans validateBlock:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
