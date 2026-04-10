import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  addCorrectiveAction,
  getIncidentStats,
  deleteIncident,
  getEcoleAdmins // <--- Nouvelle fonction à importer
} from '../controllers/incidentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- ROUTES ACCESSIBLES À TOUS LES UTILISATEURS CONNECTÉS ---
// Création d'un ticket (Apprenants ou Staff)
router.post('/', protect, createIncident);

// --- ROUTES RÉSERVÉES AU STAFF (ADMIN & ECOLE) ---

// NOUVEAU : Récupérer les administrateurs de l'école pour l'assignation
router.get('/staff/admins', protect, authorize(['admin', 'ecole']), getEcoleAdmins);

// Consultation de la liste des incidents (Tableau de bord)
router.get('/', protect, authorize(['admin', 'ecole']), getIncidents);

// Statistiques pour les rapports Qualité
router.get('/stats/summary', protect, authorize(['admin', 'ecole']), getIncidentStats);

// Consultation, Mise à jour et Actions sur un incident spécifique
router.get('/:id', protect, authorize(['admin', 'ecole']), getIncidentById);
router.put('/:id', protect, authorize(['admin', 'ecole']), updateIncident);
router.post('/:id/actions', protect, authorize(['admin', 'ecole']), addCorrectiveAction);

// Suppression (Réservé aux Super-Admins)
router.delete('/:id', protect, authorize(['admin']), deleteIncident);

export default router;