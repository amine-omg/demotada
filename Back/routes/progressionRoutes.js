import express from 'express';
import * as progressionController from '../controllers/progressionController.js'; 
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- On garde cette route qui est essentielle ---
// Elle permet à MaClassePage de récupérer la progression des modules pour un élève
router.get(
    '/session/:sessionId', 
    protect, 
    authorize(['admin', 'formateur', 'ecole', 'apprenant']),
    progressionController.getModuleProgressionForSession // Assurez-vous que cette fonction existe bien dans votre progressionController
);

// --- C'est la SEULE AUTRE route dont on a besoin pour l'instant ---
// Elle est appelée par ElearningModulePage pour initialiser et récupérer la progression des chapitres
router.get(
    '/module/:moduleId',
    protect,
    authorize(['apprenant', 'admin', 'formateur', 'ecole']),
    progressionController.getModuleProgression
);

router.post(
    '/complete',
    protect,
    authorize(['apprenant', 'admin']), // Seul un apprenant peut compléter son propre contenu
    progressionController.completeContent
);



router.post(
    '/session/:sessionId/chapter/:chapterId/initialize',
    protect,
    progressionController.initializeChapterActivities // <-- Il faut ajouter le préfixe
);

router.post(
    '/toggle-lock',
    protect,
    authorize(['admin', 'formateur', 'ecole']), // Seuls les gestionnaires peuvent le faire
    progressionController.toggleManualLock
);

export default router;