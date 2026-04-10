// backend/routes/logicValidationRoutes.js
import express from 'express';
const router = express.Router();
import * as logicValidationController from '../controllers/logicValidationController.js';

// @route   GET /api/logic-validation/:templateId
router.get('/:templateId', logicValidationController.getValidationsByTemplate);

// @route   POST /api/logic-validation
router.post('/', logicValidationController.upsertValidation);

export default router;