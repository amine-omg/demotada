// backend/routes/chapterRoutes.js
import express from 'express';
const router = express.Router();
import * as chapterController from '../controllers/chapterController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const authorizedRoles = ['admin', 'ecole', 'formateur'];

// NOUVEAU : Ajout de la route pour créer un chapitre.
// C'est cette route que votre frontend essaie d'appeler.
router.post('/', protect, authorize(authorizedRoles), chapterController.createChapter);

// Obtenir tous les chapitres (peut être filtré par formationId)
router.get('/', chapterController.getChapters);

// Gérer un chapitre spécifique par son ID
router.route('/:id')
    .get(chapterController.getChapterById)
    .put(protect, authorize(authorizedRoles), chapterController.updateChapter)
    .delete(protect, authorize(authorizedRoles), chapterController.deleteChapter);

export default router;
