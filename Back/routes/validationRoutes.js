// backend/routes/validationRoutes.js
import express from 'express';
const router = express.Router();
import * as validationController from '../controllers/validationController.js';
import { protect } from '../middleware/authMiddleware.js';

// Ligne 8 : C'est ici que ça plantait car createValidationRule était undefined
router.post('/', protect, validationController.createValidationRule);

// Ligne 11 : On garde la cohérence avec le controller
router.get('/tenant/:tenantId', protect, validationController.getTenantValidations);

export default router;