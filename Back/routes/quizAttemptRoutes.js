import express from 'express';
import * as quizAttemptController from '../controllers/quizAttemptController.js'; // À créer
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Un élève soumet ses réponses à un quiz
router.post(
  '/quizzes/:quizId/attempts',
  protect,
  quizAttemptController.submitQuizAttempt
);

/*
// Récupère toutes les tentatives d'un élève pour un quiz spécifique
router.get(
  '/quizzes/:quizId/my-attempts',
  protect,
  quizAttemptController.getMyAttemptsForQuiz
);

// Récupère les détails d'une tentative spécifique
router.get(
  '/attempts/:attemptId',
  protect,
  quizAttemptController.getAttemptById
);
*/

export default router;
