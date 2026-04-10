// backend/routes/certificationRoutes.js
import express from 'express';
const router = express.Router();
import * as certificationController from '../controllers/certificationController.js';

// @route   POST /api/certification/seal
// @desc    Appose un sceau numérique sur le document
router.post('/seal', certificationController.sealDocument);

// @route   POST /api/certification/verify
// @desc    Vérifie l'intégrité du document via son hash
router.post('/verify', certificationController.verifyIntegrity);

export default router;