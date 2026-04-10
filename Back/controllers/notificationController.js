// backend/controllers/notificationController.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Crée une nouvelle notification.
 * @route   POST /api/notifications
 * @access  Private (appelé par le système ou d'autres contrôleurs)
 */
export const createNotification = async (req, res) => {
    try {
        const { recipient, sender, type, message, link } = req.body;
        const currentUserId = req.user ? req.user.id : null;

        // Vérification de base
        if (!recipient || !type || !message) {
            return res.status(400).json({ message: "Le destinataire, le type et le message sont requis pour la notification." });
        }

        const newNotification = new Notification({
            recipient,
            sender: sender || currentUserId, // Si l'expéditeur n'est pas spécifié, utiliser l'utilisateur actuel
            type,
            message,
            link,
            read: false // Par défaut, non lue
        });

        const savedNotification = await newNotification.save();

        // Populer le destinataire et l'expéditeur pour la réponse
        const populatedNotification = await Notification.findById(savedNotification._id)
                                                        .populate('recipient', 'nom prenom email photo')
                                                        .populate('sender', 'nom prenom email photo');

        res.status(201).json(populatedNotification);
    } catch (error) { // Correction: ': any' retiré
        console.error("Erreur dans createNotification:", error);
        res.status(500).json({ message: "Erreur serveur lors de la création de la notification", error: error.message });
    }
};

/**
 * @desc    Récupère toutes les notifications pour l'utilisateur connecté.
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { read, limit = 20, skip = 0 } = req.query;

        let filter = { recipient: userId }; // Correction: ': any' retiré

        if (read !== undefined) {
            filter.read = read === 'true';
        }

        const notifications = await Notification.find(filter)
                                                .populate('sender', 'nom prenom email photo')
                                                .sort({ createdAt: -1 })
                                                .limit(parseInt(limit)) // Correction: 'as string' retiré
                                                .skip(parseInt(skip)); // Correction: 'as string' retiré

        res.status(200).json(notifications);
    } catch (error) { // Correction: ': any' retiré
        console.error("Erreur dans getMyNotifications:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des notifications", error: error.message });
    }
};

/**
 * @desc    Marque une ou plusieurs notifications comme lues.
 * @route   PUT /api/notifications/mark-as-read
 * @access  Private
 */
export const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationIds } = req.body;

        if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
            return res.status(400).json({ message: "Les IDs de notification sont requis." });
        }

        const result = await Notification.updateMany(
            { _id: { $in: notificationIds }, recipient: userId },
            { $set: { read: true } }
        );

        res.status(200).json({ message: `${result.modifiedCount} notifications marquées comme lues.` });
    } catch (error) { // Correction: ': any' retiré
        console.error("Erreur dans markNotificationsAsRead:", error);
        res.status(500).json({ message: "Erreur serveur lors du marquage des notifications comme lues", error: error.message });
    }
};

/**
 * @desc    Marque toutes les notifications de l'utilisateur comme lues.
 * @route   PUT /api/notifications/mark-all-as-read
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ message: `${result.modifiedCount} notifications marquées comme lues.` });
    } catch (error) { // Correction: ': any' retiré
        console.error("Erreur dans markAllNotificationsAsRead:", error);
        res.status(500).json({ message: "Erreur serveur lors du marquage de toutes les notifications comme lues", error: error.message });
    }
};

/**
 * @desc    Supprime une ou plusieurs notifications.
 * @route   DELETE /api/notifications/:id (ou /api/notifications/batch)
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndDelete({ _id: id, recipient: userId });

        if (!notification) {
            return res.status(404).json({ message: "Notification non trouvée ou non autorisée." });
        }

        res.status(200).json({ message: "Notification supprimée avec succès." });
    } catch (error) { // Correction: ': any' retiré
        console.error("Erreur dans deleteNotification:", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression de la notification", error: error.message });
    }
};
