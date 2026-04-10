import express from 'express';
const router = express.Router();
import * as crmConfigController from '../controllers/crmConfigController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/:tenantId', protect, crmConfigController.getCrmConfig);
router.post('/', protect, authorize(['admin', 'owner']), crmConfigController.upsertCrmConfig);

export default router;