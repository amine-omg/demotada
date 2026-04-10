import express from 'express';
const router = express.Router();
import { registerFont, getTemplateFonts } from '../controllers/fontAssetController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, registerFont);
router.get('/template/:templateId', protect, getTemplateFonts);

export default router;