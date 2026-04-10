// backend/routes/ceeValidationRoutes.js
import express from 'express';
const router = express.Router();

// Import des controllers (on va centraliser la logique dans un controller dédié)
import * as ceeController from '../controllers/ceeController.js';

// Import de tes middlewares de sécurité existants
import { protect, authorize } from '../middleware/authMiddleware.js';

/**
 * @route   POST /api/cee-validation/audit
 * @desc    Lance l'audit de conformité entre un devis/facture et les fiches CEE via Gemini
 * @access  Private
 */
router.post(
  '/audit', 
  protect, 
  ceeController.auditConformite
);

/**
 * @route   GET /api/cee-validation/stats/:templateId
 * @desc    Récupère les derniers résultats d'audit pour un document spécifique
 * @access  Private
 */
router.get(
  '/stats/:templateId', 
  protect, 
  ceeController.getAuditHistory
);

/**
 * @route   POST /api/cee-validation/simulate-calculation
 * @desc    Simulateur de calcul de kWh Cumac (mode manuel ou forcé)
 * @access  Private (Admin/Gestionnaire)
 */
router.post(
  '/simulate-calculation', 
  protect, 
  authorize(['admin', 'gestionnaire']), // On restreint le calcul manuel aux profils autorisés
  ceeController.simulateCalculation
);

export default router;