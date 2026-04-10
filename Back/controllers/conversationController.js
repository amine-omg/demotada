// backend/controllers/conversationController.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Crée une nouvelle conversation entre des participants.
 * @route   POST /api/conversations
 * @access  Private
 */
export const createConversation = async (req, res) => {
    try {
        const { participantsIds, title } = req.body;
        const currentUserId = req.user.id;

        if (!participantsIds || !Array.isArray(participantsIds) || participantsIds.length === 0) {
            return res.status(400).json({ message: "Les participants sont requis pour créer une conversation." });
        }

        // Ajouter l'utilisateur actuel s'il n'est pas déjà dans la liste
        if (!participantsIds.includes(currentUserId)) {
            participantsIds.push(currentUserId);
        }

        // Si c'est un duo, vérifier si une conversation existe déjà
        if (participantsIds.length === 2) {
            const existingConversation = await Conversation.findOne({
                participants: { $size: 2, $all: participantsIds }
            });
            if (existingConversation) {
                return res.status(200).json(existingConversation);
            }
        }

        const newConversation = new Conversation({
            participants: participantsIds,
            title: title || (participantsIds.length > 2 ? 'Nouvelle conversation de groupe' : null),
            lastMessageAt: new Date(),
        });

        const savedConversation = await newConversation.save();

        const populatedConversation = await Conversation.findById(savedConversation._id)
                                                        .populate('participants', 'nom prenom email photo');

        res.status(201).json(populatedConversation);
    } catch (error) {
        console.error("Erreur dans createConversation:", error);
        res.status(500).json({ message: "Erreur serveur lors de la création", error: error.message });
    }
};

/**
 * @desc    Récupère toutes les conversations de l'utilisateur connecté.
 * @route   GET /api/conversations
 */
export const getConversationsForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({ participants: userId })
                                                .populate('participants', 'nom prenom email photo')
                                                .sort({ lastMessageAt: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
    }
};

/**
 * @desc    Récupère une conversation spécifique par son ID.
 */
export const getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findById(conversationId)
                                            .populate('participants', 'nom prenom email photo');

        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée." });
        }

        if (!conversation.participants.some(p => p._id.toString() === userId)) {
            return res.status(403).json({ message: "Accès non autorisé." });
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

/**
 * @desc    Récupère les messages d'une conversation (avec pagination).
 */
export const getMessagesInConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { limit = 50, skip = 0 } = req.query;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Conversation non trouvée." });

        if (!conversation.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ message: "Accès refusé." });
        }

        const messages = await Message.find({ conversationId })
                                      .populate('sender', 'nom prenom email photo')
                                      .sort({ createdAt: 1 })
                                      .limit(parseInt(limit))
                                      .skip(parseInt(skip));

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Crée un message et notifie les participants.
 */
export const createMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message vide.' });
    }

    try {
        const newMessage = new Message({
            conversationId,
            sender: senderId,
            content: content.trim(),
            readBy: [senderId],
        });
        await newMessage.save();

        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { lastMessageAt: newMessage.createdAt },
            { new: true }
        ).populate('participants', 'nom prenom');

        if (updatedConversation) {
            const recipients = updatedConversation.participants.filter(
                (p) => p._id.toString() !== senderId.toString()
            );

            for (const recipient of recipients) {
                const notification = new Notification({
                    recipient: recipient._id,
                    sender: senderId,
                    type: 'new_message',
                    message: `Nouveau message de ${req.user.prenom}`,
                    link: '/chat'
                });
                await notification.save();
            }
        }

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'nom prenom photo');
        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addParticipantsToConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userIdsToAdd } = req.body;
        const currentUserId = req.user.id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Introuvable." });

        if (!conversation.participants.some(p => p.equals(currentUserId))) {
            return res.status(403).json({ message: "Action non autorisée." });
        }

        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { $addToSet: { participants: { $each: userIdsToAdd } } },
            { new: true }
        ).populate('participants', 'nom prenom email photo');

        res.status(200).json(updatedConversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        await Message.updateMany(
            { conversationId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );

        res.status(200).json({ message: "Lu." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { title } = req.body;
        
        const conversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { title },
            { new: true }
        ).populate('participants', 'nom prenom email photo');

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await Message.deleteMany({ conversationId });
        await Conversation.findByIdAndDelete(conversationId);
        res.status(200).json({ message: "Supprimée." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};