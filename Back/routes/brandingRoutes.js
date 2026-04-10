import express from 'express';
const router = express.Router();
import * as brandingController from '../controllers/brandingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/branding/:tenantId
// @desc    Récupère les couleurs et logos pour charger le thème
router.get('/:tenantId', brandingController.getBrandingByTenant);

// @route   POST /api/branding
// @desc    Définit la charte graphique (Admin ou Propriétaire du Tenant)
router.post('/', protect, authorize(['admin', 'owner']), brandingController.upsertBranding);

export default router;