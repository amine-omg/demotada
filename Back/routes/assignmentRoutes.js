// backend/routes/assignmentRoutes.js
import express from 'express';
const router = express.Router();
import * as assignmentController from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Routes pour les devoirs (Assignments)
router.post('/', protect, authorize(['admin', 'formateur']), assignmentController.createAssignment); // Créer un devoir
router.get('/', protect, assignmentController.getAssignments); // Récupérer tous les devoirs (filtrables)
router.get('/:id', protect, assignmentController.getAssignmentById); // Récupérer un devoir par ID
// router.put('/:id', protect, authorize(['admin', 'formateur']), assignmentController.updateAssignment); // Mettre à jour un devoir (à implémenter si besoin)
// router.delete('/:id', protect, authorize(['admin', 'formateur']), assignmentController.deleteAssignment); // Supprimer un devoir (à implémenter si besoin)

// Routes pour les soumissions de devoirs (Submissions)
router.post('/:id/submit', protect, authorize(['apprenant']), assignmentController.submitAssignment); // Soumettre un devoir (l'élève rend son travail)
router.put('/:assignmentId/grade-submission', protect, authorize(['admin', 'formateur']), assignmentController.gradeSubmission); // Noter une soumission spécifique

export default router;
