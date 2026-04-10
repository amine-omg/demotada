import express from 'express';
const router = express.Router();
import { updateField, deleteField } from '../controllers/fieldController.js';
import { protect } from '../middleware/authMiddleware.js'; //

router.put('/:id', protect, updateField); //
router.delete('/:id', protect, deleteField); //

export default router;