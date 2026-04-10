import express from 'express';
const router = express.Router();
import * as hubspotController from '../controllers/hubspotController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   POST /api/hubspot/connect
router.post('/connect', protect, authorize(['admin']), hubspotController.saveHubspotConnection);

// @route   GET /api/hubspot/deal/:dealId
// Route utilisée par l'iframe Kernain à l'intérieur de HubSpot
router.get('/deal/:dealId', protect, hubspotController.getDealData);

export default router;