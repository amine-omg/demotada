import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// @desc    Récupère les messages non lus pour l'utilisateur connecté
// @route   GET /api/messages/unread
// @access  Private
export const getUnreadMessages = async (req, res) => {
    try {
        // 1. Trouver toutes les conversations de l'utilisateur
        const userConversations = await Conversation.find({ participants: req.user.id }).select('_id');
        const conversationIds = userConversations.map(conv => conv._id);

        // 2. Trouver tous les messages dans ces conversations où l'utilisateur n'est pas dans 'readBy'
        const unreadMessages = await Message.find({
            conversationId: { $in: conversationIds },
            readBy: { $ne: req.user.id } // $ne signifie "not equal"
        }).countDocuments();

        res.status(200).json({ unreadCount: unreadMessages });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des messages non lus", error: error.message });
    }
};

// @desc    Marque un message comme lu
// @route   PUT /api/messages/:messageId/read
// @access  Private
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message non trouvé" });
        }

        // Ajoute l'utilisateur à la liste 'readBy' s'il n'y est pas déjà
        if (!message.readBy.includes(userId)) {
            message.readBy.push(userId);
            await message.save();
        }

        res.status(200).json({ message: "Message marqué comme lu" });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
