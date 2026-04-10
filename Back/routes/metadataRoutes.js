// backend/routes/metadataRoutes.js
import express from 'express';
const router = express.Router();
import * as metadataController from '../controllers/metadataController.js';

// @route   GET /api/metadata/:templateId
router.get('/:templateId', metadataController.getMetadataByTemplate);

// @route   POST /api/metadata
router.post('/', metadataController.upsertMetadata);

export default router;