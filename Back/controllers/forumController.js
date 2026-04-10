import Sujet from '../models/Sujet.js';
import Reponse from '../models/Reponse.js';

// @desc    Récupère tous les sujets du forum
// @route   GET /api/sujets
export const getAllSujets = async (req, res) => {
    try {
        const sujets = await Sujet.find({})
            .populate('author', 'nom prenom photo') // Récupère les infos de l'auteur
            .sort({ lastReplyAt: -1 }); // Trie par la dernière réponse
        res.status(200).json(sujets);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// @desc    Crée un nouveau sujet
// @route   POST /api/sujets
export const createSujet = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const newSujet = new Sujet({
            title,
            content,
            category,
            author: req.user.id,
        });
        const savedSujet = await newSujet.save();
        res.status(201).json(savedSujet);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du sujet", error: error.message });
    }
};

// @desc    Récupère un sujet par son ID
// @route   GET /api/sujets/:sujetId
export const getSujetById = async (req, res) => {
    try {
        const sujet = await Sujet.findById(req.params.sujetId)
            .populate('author', 'nom prenom photo');
        if (!sujet) {
            return res.status(404).json({ message: "Sujet non trouvé" });
        }
        res.status(200).json(sujet);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// @desc    Récupère les réponses d'un sujet
// @route   GET /api/sujets/:sujetId/reponses
export const getReponsesForSujet = async (req, res) => {
    try {
        const reponses = await Reponse.find({ sujetId: req.params.sujetId })
            .populate('author', 'nom prenom photo')
            .sort({ createdAt: 1 }); // Trie par date de création
        res.status(200).json(reponses);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// @desc    Poste une nouvelle réponse
// @route   POST /api/sujets/:sujetId/reponses
export const createReponse = async (req, res) => {
    try {
        const { sujetId } = req.params;
        const { content } = req.body;

        // 1. Créer la nouvelle réponse
        const newReponse = new Reponse({
            sujetId,
            content,
            author: req.user.id,
        });
        const savedReponse = await newReponse.save();

        // 2. Mettre à jour la date de la dernière réponse sur le sujet parent
        await Sujet.findByIdAndUpdate(sujetId, { lastReplyAt: Date.now() });

        // 3. Renvoyer la réponse créée (avec les infos de l'auteur)
        const populatedReponse = await Reponse.findById(savedReponse._id).populate('author', 'nom prenom photo');
        res.status(201).json(populatedReponse);

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la publication de la réponse", error: error.message });
    }
};
