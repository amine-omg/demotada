import express from 'express';
import { createAxe, getAxes } from '../controllers/axeAmeliorationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Seulement pour Admin et Ecole
router.post('/', protect, authorize(['admin', 'ecole']), createAxe);
router.get('/', protect, authorize(['admin', 'ecole']), getAxes);

export default router;