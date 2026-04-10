// backend/routes/correctionRoutes.js
import express from 'express';
const router = express.Router();
import { processVisualFeedback } from '../controllers/correctionController.js';
import TemplateSelfCorrection from '../models/TemplateSelfCorrection.js';
import { protect } from '../middleware/authMiddleware.js';

// Route pour soumettre un feedback visuel et mettre à jour l'apprentissage
router.post('/feedback', protect, processVisualFeedback);

// Route pour récupérer les corrections apprises pour un template spécifique
router.get('/template/:templateId', protect, async (req, res) => {
    try {
        const correction = await TemplateSelfCorrection.findOne({ templateId: req.params.templateId });
        if (!correction) return res.status(404).json({ message: "Aucune donnée d'apprentissage pour ce template." });
        res.json(correction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;