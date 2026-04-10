import express from 'express';
const router = express.Router();
import { 
    saveExportConfig, 
    startGeneration, 
    getArtifact 
} from '../controllers/exportController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/config', protect, saveExportConfig);
router.post('/generate', protect, startGeneration);
router.get('/artifact/:id', protect, getArtifact);

export default router;