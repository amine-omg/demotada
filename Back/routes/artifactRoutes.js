import express from 'express';
const router = express.Router();
import { completeArtifact, getArtifactDetails } from '../controllers/artifactController.js';
import { protect } from '../middleware/authMiddleware.js';

// Route utilisée par ton service de génération (IA/Worker)
router.patch('/:id/complete', protect, completeArtifact);

// Route utilisée par ton client Vue.js
router.get('/:id', protect, getArtifactDetails);

export default router;