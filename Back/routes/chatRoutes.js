// backend/routes/chatRoutes.js
import express from 'express';
const router = express.Router();
import * as conversationController from '../controllers/conversationController.js'; // Utilisez les fonctions du contrôleur de conversation
import { protect } from '../middleware/authMiddleware.js';

// --- Routes pour les Conversations ---
router.post('/conversations', protect, conversationController.createConversation);
router.get('/conversations', protect, conversationController.getConversationsForUser);
router.get('/conversations/:conversationId', protect, conversationController.getConversationById);
router.put('/conversations/:conversationId/participants', protect, conversationController.addParticipantsToConversation);
// --- Routes pour les Messages (imbriquées dans les conversations) ---
router.post('/conversations/:conversationId/messages', protect, conversationController.createMessage);
router.get('/conversations/:conversationId/messages', protect, conversationController.getMessagesInConversation);
router.put('/conversations/:conversationId/read', protect, conversationController.markMessagesAsRead); // Route pour marquer comme lus
router.delete('/conversations/:conversationId', protect, conversationController.deleteConversation);

router.put('/conversations/:conversationId', protect, conversationController.updateConversation);

export default router;
