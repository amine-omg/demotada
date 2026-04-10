// backend/routes/postRoutes.js
import express from 'express';
const router = express.Router();
import * as postController from '../controllers/postController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Routes pour les posts du fil d'actualité
router.post('/', protect, postController.createPost); // Créer un post
router.get('/', protect, postController.getPostsForSession); // Récupérer les posts d'une session
router.put('/:id', protect, postController.updatePost); // Mettre à jour un post
router.delete('/:id', protect, postController.deletePost); // Supprimer un post

// Routes pour les commentaires sur les posts
router.post('/:id/comments', protect, postController.addCommentToPost); // Ajouter un commentaire à un post
router.delete('/:postId/comments/:commentId', protect, postController.deleteComment); // Supprimer un commentaire

export default router;
