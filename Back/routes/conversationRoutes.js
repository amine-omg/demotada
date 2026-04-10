// backend/routes/conversationRoutes.js
import express from 'express';
const router = express.Router();
import * as conversationController from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

// --- Routes pour les Conversations ---

// @route   POST /api/conversations
// @desc    Créer une nouvelle conversation
router.post('/', protect, conversationController.createConversation);

// @route   GET /api/conversations
// @desc    Récupérer toutes les conversations de l'utilisateur connecté
router.get('/', protect, conversationController.getConversationsForUser);

// @route   GET /api/conversations/:conversationId
// @desc    Récupérer les détails d'une conversation spécifique
router.get('/:conversationId', protect, conversationController.getConversationById);

// @route   PUT /api/conversations/:conversationId
// @desc    Modifier une conversation (ex: changer le titre)
router.put('/:conversationId', protect, conversationController.updateConversation);

// @route   DELETE /api/conversations/:conversationId
// @desc    Supprimer une conversation et ses messages
router.delete('/:conversationId', protect, conversationController.deleteConversation);

// --- Routes pour les Messages ---

// @route   POST /api/conversations/:conversationId/messages
// @desc    Envoyer un nouveau message dans une conversation
router.post('/:conversationId/messages', protect, conversationController.createMessage);

// @route   GET /api/conversations/:conversationId/messages
// @desc    Récupérer les messages d'une conversation (pagination via query params)
router.get('/:conversationId/messages', protect, conversationController.getMessagesInConversation);

// @route   PUT /api/conversations/:conversationId/read
// @desc    Marquer les messages d'une conversation comme lus
router.put('/:conversationId/read', protect, conversationController.markMessagesAsRead);

// --- Gestion des Participants ---

// @route   POST /api/conversations/:conversationId/participants
// @desc    Ajouter des participants à une conversation existante
router.post('/:conversationId/participants', protect, conversationController.addParticipantsToConversation);

export default router;