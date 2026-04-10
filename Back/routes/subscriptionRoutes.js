import express from 'express';
const router = express.Router();
import * as subscriptionController from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/subscriptions/:tenantId/status
// @desc    Vérifier si le client a encore du quota pour générer un document
// @access  Private
router.get('/:tenantId/status', protect, subscriptionController.checkUsageQuota);

// @route   POST /api/subscriptions/subscribe
// @desc    Lier un Tenant à un plan après un paiement Stripe réussi
// @access  Private (Owner du Tenant uniquement)
router.post('/subscribe', protect, authorize(['owner', 'admin']), subscriptionController.subscribeToPlan);

export default router;