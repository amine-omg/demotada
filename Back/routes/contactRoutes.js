import express from 'express';
const router = express.Router();
import * as contactController from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   GET /api/contacts/:tenantId
router.get('/:tenantId', protect, contactController.getContacts);

// @route   POST /api/contacts
router.post('/', protect, contactController.upsertContact);

export default router;