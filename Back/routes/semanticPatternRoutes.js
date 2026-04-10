import express from 'express';
const router = express.Router();
import * as semanticPatternController from '../controllers/semanticPatternController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   POST /api/semantic-patterns
// @desc    Définir une règle de calcul automatique entre les champs
router.post('/', protect, semanticPatternController.createPattern);

// @route   GET /api/semantic-patterns/:tenantId
// @desc    Lister les automatismes d'un client
router.get('/:tenantId', protect, semanticPatternController.getPatternsByTenant);

export default router;