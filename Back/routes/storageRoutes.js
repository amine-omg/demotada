import express from 'express';
const router = express.Router();
import * as storageController from '../controllers/storageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/storage/:tenantId
router.get('/:tenantId', protect, authorize(['admin', 'owner']), storageController.getStorageConfigs);

// @route   POST /api/storage
router.post('/', protect, authorize(['admin', 'owner']), storageController.upsertStorageProvider);

// @route   DELETE /api/storage/:id
router.delete('/:id', protect, authorize(['admin', 'owner']), storageController.deleteStorageConfig);

export default router;