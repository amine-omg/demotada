import express from 'express';
const router = express.Router();
import { createAlias, updateAlias, getOrgAliases } from '../controllers/aliasMapController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createAlias);
router.put('/:id', protect, updateAlias);
router.get('/org/:orgId', protect, getOrgAliases);

export default router;