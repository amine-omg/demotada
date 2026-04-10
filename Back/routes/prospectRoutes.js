import express from 'express';
const router = express.Router();
import * as prospectController from '../controllers/prospectController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, prospectController.createProspect);
router.patch('/:id/status', protect, prospectController.updateProspectStatus);

export default router;