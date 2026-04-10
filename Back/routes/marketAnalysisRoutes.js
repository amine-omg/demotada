// src/routes/marketAnalysisRoutes.js
import express from 'express';
const router = express.Router();
import * as marketController from '../controllers/marketAnalysisController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// On utilise maintenant la nouvelle fonction "getMarketData"
router.get('/data', protect, authorize(['admin', 'ecole']), marketController.getMarketData);

router.get('/pricing-stats', protect, authorize(['admin', 'ecole']), marketController.getPricingStats);
router.get('/opportunities', protect, authorize(['admin', 'ecole']), marketController.getMarketOpportunities);
router.get('/keywords', protect, authorize(['admin', 'ecole']), marketController.getFormationKeywords);
router.get('/heatmap', protect, authorize(['admin', 'ecole']), marketController.getCompetitionHeatmap);
router.get('/top-certifications', protect, authorize(['admin', 'ecole']), marketController.getTopCertifications);


export default router;