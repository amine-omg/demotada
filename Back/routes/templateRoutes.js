// backend/routes/templateRoutes.js
import express from 'express';
const router = express.Router();
import { generateMasterBackground } from '../controllers/templateController.js';

// On importe tout sous l'alias 'templateController'
import * as templateController from '../controllers/templateController.js';
import { protect } from '../middleware/authMiddleware.js';

// Route pour l'upload initial
router.post('/upload', protect, templateController.uploadTemplate);

// Route pour le test d'extraction
router.post('/test-extract', templateController.testDirectExtraction);

// Route pour le Magic Clone (Deep Scan)
// C'est cette ligne qui faisait crasher car templateController n'était pas défini
router.post('/:id/deep-scan', templateController.runMagicScan);

// Route pour récupérer un template
router.get('/:id', protect, templateController.getTemplateById);

router.post('/generate-master', generateMasterBackground);

export default router;