import express from 'express';
const router = express.Router();
import * as folderController from '../controllers/folderController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/:tenantId', protect, folderController.getFoldersByTenant);
router.post('/', protect, folderController.createFolder);
router.patch('/:id', protect, folderController.updateFolder);

export default router;