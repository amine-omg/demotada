// backend/routes/certificateRoutes.js
import express from 'express';
const router = express.Router();
// Vérifie bien que le nom du fichier est certificateController.js (avec un 'e')
import * as certificateController from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route    GET /api/certificates/:userId
// @desc     Liste les certificats numériques associés à un utilisateur
// @access    Private
router.get('/:userId', protect, certificateController.getUserCertificates);

// @route    POST /api/certificates
// @desc     Enregistre un nouveau certificat (Importation après vérification d'identité)
// @access    Private (Admin uniquement)
router.post('/', protect, authorize('admin'), certificateController.registerCertificate);

export default router;