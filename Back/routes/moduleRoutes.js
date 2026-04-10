// NOUVEAU FICHIER : backend/routes/moduleRoutes.js
import express from 'express';
import * as moduleController from '../controllers/moduleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const authorizedRoles = ['admin', 'ecole', 'formateur'];
const router = express.Router();

// --- Routes pour un module spécifique ---
router.route('/:id')
  .get(protect, moduleController.getModuleById) // Obtenir un module par ID
  .put(protect, authorize(authorizedRoles), moduleController.updateModule) // Mettre à jour un module (titre, description)
  .delete(protect, authorize(authorizedRoles), moduleController.deleteModule); // Supprimer un module

// --- Route pour réordonner les chapitres DANS un module ---
router.put('/:id/reorder-chapters', protect, authorize(authorizedRoles), moduleController.reorderChaptersInModule);

export default router;