import Module from '../models/Module.js';
import Formation from '../models/Formation.js';
import Chapter from '../models/Chapter.js';

/**
 * @desc    Crée un nouveau module pour une formation.
 * @route   POST /api/formations/:formationId/modules
 * @access  Private (Admin, Formateur, Ecole)
 */
export const createModule = async (req, res) => {
    try {
        const { name, description, order } = req.body;
        const { formationId } = req.params;

        const newModule = new Module({
            name,
            description,
            order,
            formation: formationId,
        });

        const savedModule = await newModule.save();

        // Ajoute la référence du nouveau module à la formation parente
        await Formation.findByIdAndUpdate(formationId, {
            $push: { modules: savedModule._id }
        });

        res.status(201).json(savedModule);
    } catch (error) {
        console.error("Erreur dans createModule:", error);
        res.status(400).json({ message: "Erreur lors de la création du module", error: error.message });
    }
};

export const getModuleById = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id)
            .populate({
                path: 'chapters',
                populate: {
                    path: 'contents', // On peuple les quiz à l'intérieur des chapitres
                    select: '_id title type totalPossibleScore passingScore minScoreToPass' 
                }
            });
            
        if (!module) return res.status(404).json({ message: "Module non trouvé" });
        res.status(200).json(module);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

/**
 * @desc    Met à jour un module.
 * @route   PUT /api/modules/:id
 * @access  Private (Admin, Formateur, Ecole)
 */
export const updateModule = async (req, res) => {
    try {
        const updatedModule = await Module.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedModule) {
            return res.status(404).json({ message: "Module non trouvé" });
        }
        res.status(200).json(updatedModule);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour du module", error: error.message });
    }
};

/**
 * @desc    Supprime un module et tous ses chapitres associés.
 * @route   DELETE /api/modules/:id
 * @access  Private (Admin, Formateur, Ecole)
 */
export const deleteModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: "Module non trouvé" });
        }

        // 1. Retirer la référence du module de la formation parente
        await Formation.findByIdAndUpdate(module.formation, {
            $pull: { modules: module._id }
        });

        // 2. Supprimer tous les chapitres qui appartiennent à ce module (cascade)
        await Chapter.deleteMany({ module: module._id });

        // 3. Supprimer le module lui-même
        await module.deleteOne();

        res.status(200).json({ message: "Module supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Dans backend/controllers/moduleController.js

export const reorderChaptersInModule = async (req, res) => {
    try {
        const { chapters } = req.body; // Tableau d'IDs de chapitres ordonnés
        const { id } = req.params;     // ID du module

        // 1. Mise à jour du tableau maître dans le Module
        const updatedModule = await Module.findByIdAndUpdate(
            id,
            { $set: { chapters: chapters } },
            { new: true }
        ).populate('chapters');

        if (!updatedModule) {
            return res.status(404).json({ message: "Module non trouvé" });
        }

        // 2. LA CORRECTION : Mise à jour synchronisée du champ 'order' de chaque chapitre
        // On s'assure que chaque chapitre sait qu'il a changé de place
        const updatePromises = chapters.map((chapterId, index) => {
            return Chapter.findByIdAndUpdate(chapterId, { order: index });
        });
        await Promise.all(updatePromises);

        res.status(200).json(updatedModule);
    } catch (error) {
        console.error("Erreur réorganisation chapitres:", error);
        res.status(400).json({ 
            message: "Erreur lors de la réorganisation des chapitres", 
            error: error.message 
        });
    }
};