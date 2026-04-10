import express from 'express';
import * as progressController from '../controllers/progressController.js'; // À créer
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Récupère la progression de l'utilisateur connecté pour une formation spécifique
router.get(
  '/formations/:formationId/progress',
  protect,
  progressController.getFormationProgress
);

// Un élève marque un bloc de contenu comme "validé"
router.put(
  '/progress/validate-block',
  protect,
  progressController.validateBlock
);

export default router;
