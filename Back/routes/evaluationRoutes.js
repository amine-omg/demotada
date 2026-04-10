import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';
import evaluationController from '../controllers/evaluationController.js';

// Sauvegarde (Builder)
router.post('/:formationId/evaluation', protect, authorize(['admin', 'ecole']), evaluationController.saveEvaluation);

// Récupération d'un test spécifique
router.get('/:formationId/evaluation/:type', protect, evaluationController.getEvaluation);

// Stats pour les graphiques
router.get('/:formationId/stats/:type', protect, evaluationController.getStatsByCategory);

export default router;