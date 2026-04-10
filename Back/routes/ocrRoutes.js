// backend/routes/ocrRoutes.js
import express from 'express';
const router = express.Router();
// 1. AJOUTE l'import de la fonction processSmartOcr
import { 
  saveOcrData, 
  getOcrByTemplate, 
  processSmartOcr // <--- ICI
} from '../controllers/ocrController.js';

import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, saveOcrData);
router.get('/template/:templateId', protect, getOcrByTemplate);

// 2. AJOUTE la route qui manque pour corriger l'erreur 404
router.post('/process-smart', protect, processSmartOcr); 

export default router;