// backend/routes/quizRoutes.js
import express from 'express';
const router = express.Router();
import * as quizController from '../controllers/quizController.js';
// Make sure this import line is correct and present
import { protect, authorize } from '../middleware/authMiddleware.js';

const authorizedRoles = ['admin', 'ecole', 'formateur'];

// Route for creating a quiz
router.post('/', protect, authorize(authorizedRoles), quizController.createQuiz);

// Routes for managing a specific quiz by its ID
router.get('/:quizId', quizController.getQuizById);
router.put('/:quizId', protect, authorize(authorizedRoles), quizController.updateQuiz);
router.delete('/:quizId', protect, authorize(authorizedRoles), quizController.deleteQuiz);

export default router;
