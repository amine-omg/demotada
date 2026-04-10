import express from 'express';
const router = express.Router();
import * as planController from '../controllers/planController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/plans
// @desc    Lister tous les forfaits actifs pour les clients
// @access  Public ou Private (selon si tu veux l'afficher sur ton site vitrine)
router.get('/', planController.getActivePlans);

// @route   POST /api/plans
// @desc    Créer un nouveau forfait (ex: Syali Special)
// @access  Private (Admin Kernain uniquement)
router.post('/', protect, authorize(['admin']), planController.createPlan);

export default router;