import express from 'express';
const router = express.Router();
import * as auditController from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/audit/envelope/:envelopeId
// @desc    Récupère le journal d'audit complet d'une transaction de signature
// @access  Private (Owner, Admin)
router.get(
    '/envelope/:envelopeId', 
    protect, 
    authorize(['owner', 'admin']), 
    auditController.getSignatureAudit
);

export default router;