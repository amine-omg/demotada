// backend/routes/errorLogRoutes.js
import express from 'express';
const router = express.Router();
import { logExtractionError, getErrorsByTemplate } from '../controllers/errorLogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Seuls les admins ou owners devraient analyser les logs d'erreurs techniques
router.post('/', protect, logExtractionError);
router.get('/template/:templateId', protect, authorize(['admin', 'owner']), getErrorsByTemplate);

export default router;