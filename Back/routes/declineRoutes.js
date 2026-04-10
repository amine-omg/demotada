import express from 'express';
const router = express.Router();
import * as declineController from '../controllers/declineController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   POST /api/decline/:signerId
// @desc    Enregistre le refus officiel d'un signataire avec son motif
// @access  Public (Via token de signature)
router.post('/:signerId', declineController.recordDecline);

// @route   GET /api/decline/envelope/:envelopeId
// @desc    Consulte les raisons de l'échec d'une enveloppe
// @access  Private
router.get('/envelope/:envelopeId', protect, declineController.getDeclineRecord);

export default router;