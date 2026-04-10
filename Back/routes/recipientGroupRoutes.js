import express from 'express';
const router = express.Router();
import * as recipientGroupController from '../controllers/recipientGroupController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/:tenantId', protect, recipientGroupController.getRecipientGroups);
router.post('/', protect, recipientGroupController.createRecipientGroup);

export default router;