import express from 'express';
const router = express.Router();
import * as flowController from '../controllers/flowController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   POST /api/flows
// @desc    Enregistrer un bloc de texte détecté
router.post('/', protect, flowController.createFlowBlock);

// @route   GET /api/flows/:documentId
// @desc    Lister les paragraphes d'un document spécifique
router.get('/:documentId', protect, flowController.getDocumentFlows);

export default router;