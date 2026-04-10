import express from 'express';
const router = express.Router();
import * as workflowController from '../controllers/workflowController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, workflowController.createWorkflowStep);
router.get('/:envelopeId', protect, workflowController.getEnvelopeWorkflow);

export default router;