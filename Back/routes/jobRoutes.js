// backend/routes/jobRoutes.js
import express from 'express';
const router = express.Router();
import { getJobStatus, cancelJob } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/:id', protect, getJobStatus);
router.delete('/:id', protect, cancelJob);

export default router;