// backend/routes/documentRoutes.js
import express from 'express';
const router = express.Router();
import * as documentController from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';


const authorizedRoles = ['admin', 'ecole', 'formateur'];

// Routes pour les documents
// Créer un document (Admin, Formateur)
router.post('/', protect, authorize(authorizedRoles), documentController.createDocument);

// Récupérer les documents (tous authentifiés peuvent voir, mais les filtres s'appliqueront)
router.get('/', protect, documentController.getDocuments);

// Récupérer un document par ID
router.get('/:id', protect, documentController.getDocumentById);

// Mettre à jour un document (Admin, Formateur, ou créateur)
router.put('/:id', protect, authorize(authorizedRoles), documentController.updateDocument);

// Supprimer un document (Admin, Formateur, ou créateur)
router.delete('/:id', protect, authorize(authorizedRoles), documentController.deleteDocument);

router.put('/:id/submit-assignment', protect, authorize(['apprenant']), documentController.submitAssignment); // <-- NOUVELLE ROUTE

export default router;
