// backend/controllers/correctionController.js
import VisualDiffLog from '../models/VisualDiffLog.js';
import TemplateSelfCorrection from '../models/TemplateSelfCorrection.js';

// @desc    Enregistrer un résultat de comparaison et mettre à jour l'apprentissage
export const processVisualFeedback = async (req, res) => {
    try {
        const { templateId, discrepancies, similarityScore } = req.body;

        // 1. Loguer l'erreur visuelle
        const log = await VisualDiffLog.create(req.body);

        // 2. Mettre à jour la mémoire du template
        let correction = await TemplateSelfCorrection.findOne({ templateId });
        if (!correction) correction = new TemplateSelfCorrection({ templateId });

        discrepancies.forEach(d => {
            // Logique de "Poids" : on ajuste progressivement pour éviter les oscillations
            // ex: adjustY += deltaY * 0.5
            const idx = correction.learnedOffsets.findIndex(o => o.elementId === d.elementId);
            if (idx !== -1) {
                correction.learnedOffsets[idx].adjustY += (d.delta.dy || 0);
            } else {
                correction.learnedOffsets.push({ elementId: d.elementId, adjustY: d.delta.dy });
            }
        });

        correction.iterationCount += 1;
        await correction.save();

        res.status(200).json({ message: "Apprentissage mis à jour", similarityScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};