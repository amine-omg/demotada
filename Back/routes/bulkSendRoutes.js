import express from 'express';
const router = express.Router();
import * as bulkSendController from '../controllers/bulkSendController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   POST /api/bulk
// @desc    Lance une campagne d'envoi massif
router.post('/', protect, authorize(['admin', 'owner']), bulkSendController.createBulkTask);

// @route   GET /api/bulk/:id
// @desc    Suit l'avancement de la campagne (Barre de progression côté Vue.js)
router.get('/:id', protect, bulkSendController.getBulkStatus);

export default router;