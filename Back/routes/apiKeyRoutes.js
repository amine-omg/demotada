import express from 'express';
const router = express.Router();
import * as apiKeyController from '../controllers/apiKeyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/keys/:tenantId
router.get('/:tenantId', protect, authorize(['admin', 'owner']), apiKeyController.getApiKeysByTenant);

// @route   POST /api/keys
router.post('/', protect, authorize(['admin', 'owner']), apiKeyController.generateApiKey);

// @route   DELETE /api/keys/:id
router.delete('/:id', protect, authorize(['admin', 'owner']), apiKeyController.revokeApiKey);

export default router;