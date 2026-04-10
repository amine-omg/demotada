// backend/routes/sealRoutes.js
import express from 'express';
const router = express.Router();
import * as sealController from '../controllers/sealController.js';

// @route   POST /api/seals
router.post('/', sealController.createSeal);

// LIGNE 18 : Le crash vient probablement d'ici
// Vérifie que cette fonction est bien nommée ainsi dans le contrôleur
router.get('/:documentId', sealController.getSealByDocument);

export default router;