import express from 'express';
import * as exerciseController from '../controllers/exerciseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const authorizedRoles = ['admin', 'ecole', 'formateur'];

// --- ROUTES POUR L'EXERCICE LUI-MÊME ---
// POST /api/exercises/ (la route qui manquait pour la création)
router.post('/', protect, authorize(authorizedRoles), exerciseController.createExercise);

// Routes pour un exercice spécifique
router.route('/:id')
    .get(protect, exerciseController.getExerciseById)
    .put(protect, authorize(authorizedRoles), exerciseController.updateExercise)
    .delete(protect, authorize(authorizedRoles), exerciseController.deleteExercise); // <-- La route qui manquait pour la suppression

// --- ROUTES POUR LES QUESTIONS À L'INTÉRIEUR D'UN EXERCICE ---
router.post('/:exerciseId/questions', protect, authorize(authorizedRoles), exerciseController.addQuestionToExercise);
router.put('/:exerciseId/questions/:questionId', protect, authorize(authorizedRoles), exerciseController.updateQuestionInExercise);
router.delete('/:exerciseId/questions/:questionId', protect, authorize(authorizedRoles), exerciseController.deleteQuestionFromExercise);

router.post('/:exerciseId/submit', protect, exerciseController.submitExercise);

export default router;
