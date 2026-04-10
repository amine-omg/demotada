// backend/routes/notificationRoutes.js
import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Assurez-vous que authorize est importé si vous l'utilisez

// Routes pour les notifications
router.post('/', protect, notificationController.createNotification); // Création de notification (souvent appelée par d'autres contrôleurs)
router.get('/', protect, notificationController.getMyNotifications); // Récupérer mes notifications
router.put('/mark-as-read', protect, notificationController.markNotificationsAsRead); // Marquer comme lue(s)
router.put('/mark-all-as-read', protect, notificationController.markAllNotificationsAsRead); // Marquer tout comme lu
router.delete('/:id', protect, notificationController.deleteNotification); // Supprimer une notification

export default router;
