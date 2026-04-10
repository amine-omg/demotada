// backend/routes/customFieldRoutes.js
import express from 'express';
const router = express.Router();
import { createCustomField, getOrgCustomFields, deleteCustomField } from '../controllers/customFieldController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createCustomField);
router.get('/org/:orgId', protect, getOrgCustomFields);
router.delete('/:id', protect, deleteCustomField);

export default router;