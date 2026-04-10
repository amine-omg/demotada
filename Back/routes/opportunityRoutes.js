import express from 'express';
const router = express.Router();
import * as opportunityController from '../controllers/opportunityController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, opportunityController.createOpportunity);
router.get('/contact/:contactId', protect, opportunityController.getOpportunitiesByContact);

export default router;