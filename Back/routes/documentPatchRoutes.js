// backend/routes/documentPatchRoutes.js
import express from 'express';
const router = express.Router();
// Importation du contrôleur avec l'extension .js obligatoire
import * as documentPatchController from '../controllers/documentPatchController.js';

// @route   GET /api/patches/:documentId
// @desc    Récupère tous les "correctifs" appliqués à un document spécifique
router.get('/:documentId', documentPatchController.getPatchesByDocument);

// @route   POST /api/patches
// @desc    Enregistre une nouvelle modification (ex: correction d'une faute dans un nom)
router.post('/', documentPatchController.applyPatch);

// @route   DELETE /api/patches/:patchId
// @desc    Annule une modification spécifique
// Note : Assure-toi que la fonction s'appelle bien revertPatch dans ton controller
router.delete('/:patchId', documentPatchController.revertPatch);

export default router;