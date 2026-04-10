import AnchorStrategy from '../models/AnchorStrategy.js';

// @desc    Définir une règle d'ancrage pour un champ
export const createAnchor = async (req, res) => {
    try {
        const { fieldId, anchorText, offset, relation } = req.body;
        // relation: 'above', 'below', 'left', 'right'
        
        const anchor = await AnchorStrategy.create({
            fieldId,
            anchorText,
            offset, // { x: 0, y: 20 }
            relation
        });

        res.status(201).json(anchor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer les ancres d'un template
export const getTemplateAnchors = async (req, res) => {
    try {
        const anchors = await AnchorStrategy.find().populate({
            path: 'fieldId',
            match: { templateId: req.params.templateId }
        });
        res.json(anchors.filter(a => a.fieldId !== null));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};