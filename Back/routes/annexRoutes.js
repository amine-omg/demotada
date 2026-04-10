// backend/routes/annexRoutes.js
import express from 'express';
const router = express.Router();
// Importation avec l'extension .js obligatoire en ES Modules
import * as annexController from '../controllers/annexController.js';

// @route    GET /api/annexes/files/:templateId
// @desc     Récupère la liste des fichiers PDF/Images physiques rattachés aux annexes
router.get('/files/:templateId', annexController.getAnnexFiles);

// @route    POST /api/annexes/upload
// @desc     Upload un nouveau fichier d'annexe (ex: un scan de CGV) sur le serveur/S3
router.post('/upload', annexController.uploadAnnexFile);

// @route    POST /api/annexes/order
// @desc     Réorganise l'ordre de fusion des annexes dans le PDF final
router.post('/order', annexController.updateAnnexOrder);

export default router;