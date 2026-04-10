// backend/routes/interactiveRoutes.js
import express from 'express';
const router = express.Router();
import * as interactiveController from '../controllers/interactiveController.js';

// @route   GET /api/interactive/:templateId
router.get('/:templateId', interactiveController.getInteractiveByTemplate);

// @route   POST /api/interactive
router.post('/', interactiveController.upsertInteractive);

export default router;