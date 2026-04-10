// Fichier : backend/routes/logRoutes.js
import express from 'express';
import { getUserLogs } from '../controllers/logController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour récupérer les logs d'un utilisateur (accessible aux admins)
router.get('/user/:userId', protect, authorize(['admin']), getUserLogs);

// Route pour exporter les logs en CSV (accessible aux admins)
// router.get('/user/:userId/csv', protect, authorize(['admin']), exportUserLogsAsCsv);

export default router;