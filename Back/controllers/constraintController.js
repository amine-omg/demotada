import Constraint from '../models/Constraint.js';

// Définir une contrainte d'affichage pour un champ
export const createConstraint = async (req, res) => {
    try {
        const { fieldId, overflowStrategy, maxWidth, maxHeight, fontSizeLimit } = req.body;

        const constraint = new Constraint({
            fieldId,
            overflowStrategy: overflowStrategy || 'shrink', // 'shrink', 'truncate', 'wrap'
            maxWidth,
            maxHeight,
            fontSizeLimit: fontSizeLimit || { min: 6, max: 12 }
        });

        await constraint.save();
        res.status(201).json(constraint);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer les contraintes d'un champ spécifique
export const getFieldConstraints = async (req, res) => {
    try {
        const { fieldId } = req.params;
        const constraint = await Constraint.findOne({ fieldId });
        res.status(200).json(constraint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};