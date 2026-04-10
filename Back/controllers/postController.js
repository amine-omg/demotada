// backend/controllers/postController.js
import Post from '../models/Post.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

/**
 * @desc    Crée un nouveau post dans le fil d'actualité d'une session.
 * @route   POST /api/posts
 * @access  Private (Tous les utilisateurs authentifiés de la session)
 */
export const createPost = async (req, res) => {
  try {
    const { session, content, attachments } = req.body;
    const author = req.user.id; // L'ID de l'utilisateur authentifié

    if (!session || !content) {
      return res.status(400).json({ message: "La session et le contenu du post sont requis." });
    }

    // Vérifier si l'utilisateur est bien membre (formateur ou élève) de cette session
    const targetSession = await Session.findById(session);
    if (!targetSession) {
      return res.status(404).json({ message: "Session non trouvée." });
    }

    const isMember = targetSession.formateurs.some(f => f.userId.toString() === author) ||
                     targetSession.elevesInscrits.some(e => e.userId.toString() === author);

    // Si l'utilisateur est un admin, il peut poster même s'il n'est pas un membre direct de la session
    const user = await User.findById(author);
    const isAdmin = user && user.role === 'admin';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée. Vous n'êtes pas membre de cette session." });
    }

    const newPost = new Post({
      session,
      author,
      content,
      attachments: attachments || [],
    });

    const savedPost = await newPost.save();
    // Peupler l'auteur pour la réponse immédiate
    await savedPost.populate('author', 'nom prenom photo');
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Erreur dans createPost:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du post", error: error.message });
  }
};

/**
 * @desc    Récupère tous les posts pour une session spécifique, triés par date décroissante.
 * @route   GET /api/posts?sessionId=:sessionId
 * @access  Private (Membres de la session)
 */
export const getPostsForSession = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user.id; // L'ID de l'utilisateur authentifié

    if (!sessionId) {
      return res.status(400).json({ message: "L'ID de la session est requis." });
    }

    // Vérifier si l'utilisateur est membre (formateur ou élève) de cette session ou un admin
    const targetSession = await Session.findById(sessionId);
    if (!targetSession) {
      return res.status(404).json({ message: "Session non trouvée." });
    }

    const isMember = targetSession.formateurs.some(f => f.userId.toString() === userId) ||
                     targetSession.elevesInscrits.some(e => e.userId.toString() === userId);
    const user = await User.findById(userId);
    const isAdmin = user && user.role === 'admin';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée. Vous n'êtes pas membre de cette session." });
    }

    const posts = await Post.find({ session: sessionId })
      .populate('author', 'nom prenom photo') // Peupler les infos de l'auteur
      .populate('comments.user', 'nom prenom photo') // Peupler les infos des utilisateurs qui commentent
      .sort({ createdAt: -1 }); // Trier par date de création décroissante (du plus récent au plus ancien)

    res.status(200).json(posts);
  } catch (error) {
    console.error("Erreur dans getPostsForSession:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des posts", error: error.message });
  }
};

/**
 * @desc    Met à jour un post (seul l'auteur ou un admin peut le faire).
 * @route   PUT /api/posts/:id
 * @access  Private
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé." });
    }

    const user = await User.findById(userId);
    const isAdmin = user && user.role === 'admin';

    // Seul l'auteur ou un admin peut modifier le post
    if (post.author.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée. Vous n'êtes pas l'auteur de ce post ou un administrateur." });
    }

    post.content = content || post.content;
    post.attachments = attachments || post.attachments;

    const updatedPost = await post.save();
    await updatedPost.populate('author', 'nom prenom photo');
    await updatedPost.populate('comments.user', 'nom prenom photo');
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Erreur dans updatePost:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du post", error: error.message });
  }
};

/**
 * @desc    Supprime un post (seul l'auteur, un formateur ou un admin peut le faire).
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé." });
    }

    const user = await User.findById(userId);
    const isAdmin = user && user.role === 'admin';

    // Vérifier si l'utilisateur est formateur dans la session du post
    const session = await Session.findById(post.session);
    const isFormateurInSession = session?.formateurs.some(f => f.userId.toString() === userId);


    // Seul l'auteur, un formateur de la session ou un admin peut supprimer le post
    if (post.author.toString() !== userId && !isAdmin && !isFormateurInSession) {
      return res.status(403).json({ message: "Action non autorisée. Vous n'êtes pas l'auteur, un formateur de la session ou un administrateur." });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post supprimé avec succès." });
  } catch (error) {
    console.error("Erreur dans deletePost:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du post", error: error.message });
  }
};

/**
 * @desc    Ajoute un commentaire à un post.
 * @route   POST /api/posts/:id/comments
 * @access  Private (Membres de la session)
 */
export const addCommentToPost = async (req, res) => {
  try {
    const { id } = req.params; // ID du post
    const { content } = req.body;
    const userId = req.user.id; // L'utilisateur qui commente

    if (!content) {
      return res.status(400).json({ message: "Le contenu du commentaire est requis." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé." });
    }

    // Vérifier si l'utilisateur est membre de la session
    const targetSession = await Session.findById(post.session);
    const isMember = targetSession?.formateurs.some(f => f.userId.toString() === userId) ||
                     targetSession?.elevesInscrits.some(e => e.userId.toString() === userId);
    const user = await User.findById(userId);
    const isAdmin = user && user.role === 'admin';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée. Vous n'êtes pas membre de cette session." });
    }

    const newComment = {
      user: userId,
      content,
    };

    post.comments.push(newComment);
    const updatedPost = await post.save();

    // Peupler l'auteur du post et les utilisateurs des commentaires pour la réponse
    await updatedPost.populate('author', 'nom prenom photo');
    await updatedPost.populate('comments.user', 'nom prenom photo');

    res.status(201).json(updatedPost); // Renvoie le post mis à jour avec le nouveau commentaire
  } catch (error) {
    console.error("Erreur dans addCommentToPost:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du commentaire", error: error.message });
  }
};

/**
 * @desc    Supprime un commentaire d'un post.
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @access  Private (Auteur du commentaire, auteur du post, formateur, admin)
 */
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé." });
    }

    const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Commentaire non trouvé." });
    }

    const comment = post.comments[commentIndex];
    const user = await User.findById(userId);
    const isAdmin = user && user.role === 'admin';

    // Vérifier si l'utilisateur est formateur dans la session du post
    const session = await Session.findById(post.session);
    const isFormateurInSession = session?.formateurs.some(f => f.userId.toString() === userId);

    // L'auteur du commentaire, l'auteur du post, un formateur de la session ou un admin peut supprimer le commentaire
    if (comment.user.toString() !== userId && post.author.toString() !== userId && !isAdmin && !isFormateurInSession) {
      return res.status(403).json({ message: "Action non autorisée. Vous n'êtes pas autorisé à supprimer ce commentaire." });
    }

    post.comments.splice(commentIndex, 1);
    const updatedPost = await post.save();

    await updatedPost.populate('author', 'nom prenom photo');
    await updatedPost.populate('comments.user', 'nom prenom photo');

    res.status(200).json(updatedPost); // Renvoie le post mis à jour
  } catch (error) {
    console.error("Erreur dans deleteComment:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du commentaire", error: error.message });
  }
};
