import express from 'express';
const router = express.Router();
import * as envelopeController from '../controllers/envelopeController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   POST /api/envelopes
router.post('/', protect, envelopeController.createEnvelope);

// @route   POST /api/envelopes/:id/send
router.post('/:id/send', protect, envelopeController.sendEnvelope);

// @route   GET /api/envelopes/:id
router.get('/:id', protect, envelopeController.getEnvelopeStatus);

export default router;