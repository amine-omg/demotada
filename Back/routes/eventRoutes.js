import express from 'express';
// CORRIGÉ : On importe toutes les fonctions exportées sous l'alias 'eventController'
import * as eventController from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Crée un nouvel événement
router.post(
  '/events',
  protect,
  eventController.createEvent
);

// Récupère les événements de l'utilisateur
router.get(
  '/events',
  protect,
  eventController.getEvents
);

// Met à jour un événement
router.put(
  '/events/:eventId',
  protect,
  eventController.updateEvent
);

// Supprime un événement
router.delete(
  '/events/:eventId',
  protect,
  eventController.deleteEvent
);

export default router;
