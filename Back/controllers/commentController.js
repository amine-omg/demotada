import Comment from '../models/Comment.js';
import ActivityLog from '../models/ActivityLog.js';

// Ajouter un commentaire sur un document
export const addComment = async (req, res) => {
    try {
        const { documentId, tenantId, content, position, page } = req.body;

        const comment = new Comment({
            documentId,
            tenantId,
            authorId: req.user._id,
            content,
            position, // ex: { x: 120, y: 450 } pour placement sur le PDF
            page: page || 1,
            status: 'pending'
        });

        await comment.save();

        // On peut ajouter un log d'activité
        // await ActivityLog.create({ ... }) 

        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer les commentaires d'un document
export const getDocumentComments = async (req, res) => {
    try {
        const { documentId } = req.params;
        const comments = await Comment.find({ documentId })
            .populate('authorId', 'nom prenom photo')
            .sort({ createdAt: 1 });

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Marquer un commentaire comme résolu (pour nettoyer l'interface)
export const resolveComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndUpdate(
            id,
            { status: 'resolved', resolvedAt: Date.now(), resolvedBy: req.user._id },
            { new: true }
        );
        res.status(200).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Supprimer un commentaire
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        
        // Seul l'auteur ou un admin peut supprimer
        if (comment.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Action non autorisée." });
        }

        await comment.deleteOne();
        res.status(200).json({ message: "Commentaire supprimé." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};