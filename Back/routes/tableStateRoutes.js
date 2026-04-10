// backend/routes/tableStateRoutes.js
import express from 'express';
const router = express.Router();
import * as tableStateController from '../controllers/tableStateController.js';

// @route   GET /api/table-state/:userId/:tableId
router.get('/:userId/:tableId', tableStateController.getTableState);

// @route   PATCH /api/table-state
// LIGNE 15 : Le crash venait d'ici car la fonction était probablement mal nommée
router.patch('/', tableStateController.updateTableState);

export default router;