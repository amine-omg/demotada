import express from 'express';
const router = express.Router();
import { createAnchor, getTemplateAnchors } from '../controllers/anchorController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createAnchor);
router.get('/template/:templateId', protect, getTemplateAnchors);

export default router;