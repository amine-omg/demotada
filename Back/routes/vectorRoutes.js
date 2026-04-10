// Back/routes/vectorRoutes.js
import express from 'express';
import { extractVectorsAction, getVectorsByTemplate, saveVectors, cleanBackgroundAction } from '../controllers/vectorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Vérifie que c'est bien "extractVectorsAction" ici :
router.post('/extract', protect, extractVectorsAction); 

router.get('/:templateId', protect, getVectorsByTemplate);
router.post('/save', protect, saveVectors);
router.post('/clean-background', protect, cleanBackgroundAction);

export default router;