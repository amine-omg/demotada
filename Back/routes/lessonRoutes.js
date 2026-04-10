// backend/routes/lessonRoutes.js
import express from 'express';
const router = express.Router();
import * as lessonController from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const authorizedRoles = ['admin', 'ecole', 'formateur'];

// Routes pour les leçons
router.post('/', protect, authorize(authorizedRoles), lessonController.createLesson);
router.get('/:id', protect, lessonController.getLessonById); // Pour récupérer une leçon spécifique (utile pour LessonBuilderPage)
router.put('/:id', protect, authorize(authorizedRoles), lessonController.updateLesson);
router.delete('/:id', protect, authorize(authorizedRoles), lessonController.deleteLesson);

export default router;
