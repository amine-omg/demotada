// backend/routes/coursRoutes.js
import express from 'express';
const router = express.Router();
import * as coursController from '../controllers/coursController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const authorizedRoles = ['admin', 'ecole', 'formateur'];

// Routes pour les journées de cours
router.post('/', protect, authorize(authorizedRoles), coursController.createCours);

// NOUVELLE ROUTE POUR LE PROCHAIN COURS UNIQUEMENT - DOIT ÊTRE AVANT /:id
router.get('/next', protect, coursController.getNextCoursForSession); // <-- PLACEZ CELA ICI !

router.get('/', protect, coursController.getCoursForSession); // Pour récupérer TOUS les cours d'une session

router.get('/:id', protect, coursController.getCoursById); // <-- DÉPLACÉE APRÈS /next
router.put('/:id', protect, authorize(authorizedRoles), coursController.updateCours);
router.delete('/:id', protect, authorize(authorizedRoles), coursController.deleteCours);



export default router;