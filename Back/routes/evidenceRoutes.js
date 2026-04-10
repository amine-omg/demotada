import express from 'express';
const router = express.Router();
import * as evidenceController from '../controllers/evidenceController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   GET /api/evidence/summary/:envelopeId
// @desc    Génère ou récupère le certificat d'achèvement (Preuve Juridique)
// @access  Private
router.get('/summary/:envelopeId', protect, evidenceController.generateEvidenceSummary);

// @route   GET /api/evidence/verify/:hash
// @desc    Vérifie l'intégrité d'un document via son empreinte (Hash)
// @access  Public (Permet de vérifier un document Kernain sans compte)
router.get('/verify/:hash', evidenceController.verifyDocumentIntegrity);

export default router;