import express from 'express';
const router = express.Router();
import * as constraintController from '../controllers/constraintController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   POST /api/constraints
// @desc    Appliquer des limites de taille et comportement à une zone
router.post('/', protect, constraintController.createConstraint);

// @route   GET /api/constraints/:fieldId
// @desc    Récupérer les règles de rendu d'un champ
router.get('/:fieldId', protect, constraintController.getFieldConstraints);

export default router;