import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js'; 

// 1. AJOUT de l'import de 'checkMyEvaluation'
import { 
  submitEvaluation, 
  getResultsByFormation,
  deleteEvaluation,
  checkMyEvaluation // <-- AJOUTÉ ICI
} from '../controllers/userEvaluationController.js';

// 2. NOUVELLE ROUTE de vérification pour l'apprenant
// C'est celle-ci que le front cherche et qui causait le 404
router.get('/check/:formationId/:type', protect, checkMyEvaluation);

// Route pour soumettre un test (Apprenant)
router.post('/save', protect, submitEvaluation);

// Route pour récupérer les résultats d'une formation (Admin/Ecole)
router.get('/:formationId/stats/:type', protect, authorize(['admin', 'ecole']), getResultsByFormation);

// Route pour supprimer une copie (Admin/Ecole force l'apprenant à repasser le test)
router.delete('/:id', protect, authorize(['admin', 'ecole']), deleteEvaluation);

export default router;