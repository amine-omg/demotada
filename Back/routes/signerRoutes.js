import express from 'express';
const router = express.Router();
import * as signerController from '../controllers/signerController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   POST /api/signers
router.post('/', protect, signerController.addSignerToEnvelope);

// @route   PATCH /api/signers/:id/status
// Cette route est souvent publique (token d'accès) ou sécurisée par OTP
router.patch('/:id/status', signerController.updateSignerStatus);

export default router;