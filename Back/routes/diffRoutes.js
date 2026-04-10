// backend/routes/diffRoutes.js
import express from 'express';
const router = express.Router();
import { createDiffLog, getDiffsByTemplate, getDiffById } from '../controllers/diffController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Seul le système (ou un admin) devrait poster des rapports de diff
router.post('/', protect, createDiffLog);

// Pour consulter les erreurs visuelles via le dashboard
router.get('/template/:templateId', protect, getDiffsByTemplate);
router.get('/:id', protect, getDiffById);

export default router;