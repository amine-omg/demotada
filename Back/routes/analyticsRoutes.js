import express from 'express';
import { getPerformanceTunnel, getSessionsOverview } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assure-toi que le chemin est correct selon ton architecture

const router = express.Router();

// 📊 Route pour le tunnel de performance (Inscriptions, Démarrages, CA...)
// -> Appelée par PerformanceReport.vue : GET /api/analytics/performance?timeframe=mois
router.get('/performance', protect, getPerformanceTunnel);

// 🚀 Route pour la tour de contrôle des sessions (Statuts, complétion, portefeuille...)
// -> Appelée par SessionsReport.vue : GET /api/analytics/sessions
router.get('/sessions', protect, getSessionsOverview);

export default router;