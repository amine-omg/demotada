import express from 'express';
const router = express.Router();
import * as webhookController from '../controllers/webhookController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/webhooks/:tenantId
router.get('/:tenantId', protect, authorize(['admin', 'owner']), webhookController.getWebhooksByTenant);

// @route   POST /api/webhooks
router.post('/', protect, authorize(['admin', 'owner']), webhookController.createWebhook);

export default router;