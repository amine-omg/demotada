import express from 'express';
const router = express.Router();
import * as tableController from '../controllers/tableController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/tables/:templateId
// @desc    Liste les structures de tableaux définies pour ce template
router.get('/:templateId', protect, tableController.getTableStructuresByTemplate);

// @route   POST /api/tables
// @desc    Définit comment extraire les données pour remplir une grille
router.post('/', protect, authorize(['admin', 'designer']), tableController.upsertTableStructure);

// @route   DELETE /api/tables/:id
router.delete('/:id', protect, authorize(['admin', 'designer']), tableController.deleteTableStructure);

export default router;