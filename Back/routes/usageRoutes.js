import express from 'express';
const router = express.Router();
import * as usageController from '../controllers/usageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/usage/:tenantId
// @desc    Admin ou Owner consultent la consommation pour la facture
router.get('/:tenantId', protect, authorize(['admin', 'owner']), usageController.getTenantUsageStats);

// @route   POST /api/usage/log
// @desc    Route interne (souvent appelée par le serveur lui-même)
router.post('/log', protect, usageController.logUsage);

export default router;