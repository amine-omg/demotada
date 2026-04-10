import express from 'express';
const router = express.Router();
import * as activityLogController from '../controllers/activityLogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/logs/document/:documentId
// @desc    Historique complet d'un document (Preuve de signature)
router.get('/document/:documentId', protect, activityLogController.getDocumentHistory);

// @route   GET /api/logs/tenant/:tenantId
// @desc    Journal d'audit global pour un client
router.get('/tenant/:tenantId', protect, authorize(['admin', 'owner']), activityLogController.getTenantActivity);

export default router;