// backend/routes/inkStyleRoutes.js
import express from 'express';
const router = express.Router();
import * as inkStyleController from '../controllers/inkStyleController.js';

// @route   GET /api/ink-styles/:templateId/:fieldId
router.get('/:templateId/:fieldId', inkStyleController.getInkStyleByField);

// @route   POST /api/ink-styles
router.post('/', inkStyleController.upsertInkStyle);

export default router;