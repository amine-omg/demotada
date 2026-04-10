import express from 'express';
const router = express.Router();
import * as typographyController from '../controllers/typographyController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   GET /api/typography
// @desc    Récupérer les réglages de rendu visuel
router.get('/', protect, typographyController.getTypographyRules);

// @route   POST /api/typography/config
// @desc    Modifier les paramètres (hyphenation, couleurs)
router.post('/config', protect, typographyController.updateTypographyConfig);

export default router;