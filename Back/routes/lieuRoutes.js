// backend/routes/lieuRoutes.js
import express from 'express';
import {
    createLieu,
    getLieuxForEcole,
    getLieuById,
    updateLieu,
    deleteLieu,
    getConflictingSessionsForLieu
} from '../controllers/lieuController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// On protège toutes les routes et on autorise les rôles 'admin' et 'ecole'
router.use(protect, authorize('admin', 'ecole'));

router.route('/')
    .post(createLieu) // Créer un nouveau lieu pour l'école de l'utilisateur
    .get(getLieuxForEcole); // Obtenir tous les lieux pour l'école de l'utilisateur

router.route('/:id/conflicting-sessions').get(getConflictingSessionsForLieu);

router.route('/:id')
    .get(getLieuById) // Obtenir un lieu par son ID
    .put(updateLieu) // Mettre à jour un lieu
    .delete(deleteLieu); // Supprimer un lieu

export default router;
