import express from 'express';
const router = express.Router();
import * as blueprintController from '../controllers/blueprintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   POST /api/blueprints
// @desc    Créer un nouveau pack de template
router.post('/', protect, authorize(['admin', 'designer']), blueprintController.createBlueprint);

// @route   GET /api/blueprints/:tenantId
// @desc    Lister les templates disponibles pour un client
router.get('/:tenantId', protect, blueprintController.getBlueprintsByTenant);

// @route   PATCH /api/blueprints/:id/status
// @desc    Publier ou archiver un template
router.patch('/:id/status', protect, authorize(['admin']), blueprintController.updateBlueprintStatus);

export default router;