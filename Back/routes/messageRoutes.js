import express from 'express';
import * as messageController from '../controllers/messageController.js'; // À créer
import { protect } from '../middleware/authMiddleware.js'; // À créer ou à adapter

const router = express.Router();

// Récupère les messages non lus de l'utilisateur sur toutes ses conversations
router.get(
    '/messages/unread',
    protect,
    messageController.getUnreadMessages
);

// Marque un message spécifique comme lu
router.put(
    '/messages/:messageId/read',
    protect,
    messageController.markMessageAsRead
);

export default router;
