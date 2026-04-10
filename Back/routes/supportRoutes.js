import express from 'express';
import * as supportController from '../controllers/supportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const authorizedRoles = ['admin', 'ecole', 'formateur'];



router.post('/', protect, authorize(authorizedRoles), supportController.createSupport);
router.get('/:id', protect, supportController.getSupportById);
router.put('/:id', protect, authorize(authorizedRoles), supportController.updateSupport);
router.delete('/:id', protect, authorize(authorizedRoles), supportController.deleteSupport);

export default router;