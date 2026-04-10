// backend/routes/colorProfileRoutes.js
import express from 'express';
const router = express.Router();
import * as colorProfileController from '../controllers/colorProfileController.js';

// @route   GET /api/color-profiles/:templateId
router.get('/:templateId', colorProfileController.getProfileByTemplate);

// @route   POST /api/color-profiles
router.post('/', colorProfileController.upsertColorProfile);

export default router;