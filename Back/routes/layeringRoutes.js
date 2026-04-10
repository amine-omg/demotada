// backend/routes/layeringRoutes.js
import express from 'express';
const router = express.Router();
import * as layeringController from '../controllers/layeringController.js';

// @route   GET /api/layering/:templateId
router.get('/:templateId', layeringController.getLayersByTemplate);

// @route   POST /api/layering
router.post('/', layeringController.upsertLayer);

export default router;