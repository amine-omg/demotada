// backend/routes/semanticRoutes.js
import express from 'express';
const router = express.Router();
import { createSemanticContext, identifyDocumentContext } from '../controllers/semanticController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createSemanticContext);
router.post('/identify', protect, identifyDocumentContext);

export default router;