import express from 'express';
const router = express.Router();
import * as commentController from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   POST /api/comments
// @desc    Laisser une annotation sur un document
router.post('/', protect, commentController.addComment);

// @route   GET /api/comments/doc/:documentId
// @desc    Charger les annotations pour l'affichage PDF
router.get('/doc/:documentId', protect, commentController.getDocumentComments);

// @route   PATCH /api/comments/:id/resolve
// @desc    Marquer un point comme traité
router.patch('/:id/resolve', protect, commentController.resolveComment);

// @route   DELETE /api/comments/:id
router.delete('/:id', protect, commentController.deleteComment);

export default router;