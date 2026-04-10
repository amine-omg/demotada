// backend/routes/annexRoutes.js
import express from 'express';
const router = express.Router();
import * as annexController from '../controllers/annexManagerController.js';

// @route   GET /api/annex/:templateId
router.get('/:templateId', annexController.getAnnexesByTemplate);

// @route   POST /api/annex
router.post('/', annexController.upsertAnnex);

// @route   DELETE /api/annex/:id
router.delete('/:id', annexController.deleteAnnex);

export default router;