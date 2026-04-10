// backend/controllers/lieuController.js
import Lieu from '../models/Lieu.js';
import Ecole from '../models/Ecole.js'; // Assurez-vous que le chemin est correct
import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js'; 

export const createLieu = asyncHandler(async (req, res) => {
    // --- MODIFICATION CI-DESSOUS ---
    const { nom, adresse, capacite, emailContact, nomContact, description, moyenAcces, prixParJour, prixParDemiJournee, statut, proprietaireLocaux, ecole } = req.body;

    // On prend l'ID de l'école depuis le corps de la requête (envoyé par le front)
    // S'il n'est pas là, on se rabat sur l'entité associée à l'utilisateur (pour la sécurité)
    const ecoleId = ecole || req.user.associatedEntity;
    
    if (!ecoleId) {
        res.status(400);
        throw new Error("L'identifiant de l'établissement est manquant pour la création.");
    }

    const ecoleExiste = await Ecole.findById(ecoleId);
    if (!ecoleExiste) {
        res.status(404);
        throw new Error("École non trouvée.");
    }
    
    // On continue avec l'ecoleId validé
    const lieu = new Lieu({
        nom,
        adresse,
        capacite,
        emailContact,
        nomContact,
        description,
        moyenAcces,
        prixParJour,
        prixParDemiJournee,
        statut,
        proprietaireLocaux,
        ecole: ecoleId // On utilise l'ID validé
    });

    const createdLieu = await lieu.save();
    res.status(201).json(createdLieu);
});

export const getConflictingSessionsForLieu = asyncHandler(async (req, res) => {
    const lieuId = req.params.id;

    const sessionsActives = await Session.find({
        lieu: lieuId,
        status: { $in: ['en cours', 'à venir'] }
    }).select('title dateDebut'); // On ne renvoie que les infos utiles

    res.status(200).json(sessionsActives);
});


export const getLieuxForEcole = asyncHandler(async (req, res) => {
    const ecoleId = req.query.ecoleId || req.user.associatedEntity;
    if (!ecoleId) {
        res.status(400);
        throw new Error("Utilisateur non associé à une école.");
    }

    // On trie pour avoir le lieu par défaut (Distanciel) en premier
    const lieux = await Lieu.find({ ecole: ecoleId }).sort({ isDefault: -1, createdAt: 1 });
    res.json(lieux);
});

/**
 * @desc    Récupérer un lieu par son ID
 * @route   GET /api/lieux/:id
 * @access  Privé (Ecole, Admin)
 */
export const getLieuById = asyncHandler(async (req, res) => {
    const lieu = await Lieu.findById(req.params.id);

    if (lieu) {
        // Vérifier que le lieu appartient bien à l'école de l'utilisateur
        if (lieu.ecole.toString() !== req.user.associatedEntity.toString()) {
            res.status(403);
            throw new Error("Accès non autorisé à ce lieu.");
        }
        res.json(lieu);
    } else {
        res.status(404);
        throw new Error('Lieu non trouvé');
    }
});

export const updateLieu = asyncHandler(async (req, res) => {
    const { nom, adresse, capacite, emailContact, nomContact, description, moyenAcces, prixParJour, prixParDemiJournee, statut, proprietaireLocaux } = req.body;

    const lieu = await Lieu.findById(req.params.id);

    if (lieu) {
        // --- MODIFICATION DE LA VÉRIFICATION DES PERMISSIONS ---
        const isOwner = lieu.ecole.toString() === req.user.associatedEntity?.toString();
        const isAdmin = req.user.role === 'admin';

        // L'utilisateur doit être soit admin, soit propriétaire du lieu.
        if (!isAdmin && !isOwner) {
            res.status(403);
            throw new Error("Accès non autorisé à modifier ce lieu.");
        }
        // --- FIN DE LA MODIFICATION ---

        // --- NOUVEAU BLOC DE VÉRIFICATION ---
        // On exécute cette logique uniquement si on essaie de passer le statut à "Inactif"
        if (statut === 'Inactif' && lieu.statut === 'Actif') {
            // Chercher s'il existe des sessions 'en cours' ou 'à venir' utilisant ce lieu
            const sessionsActives = await Session.find({
                lieu: lieu._id,
                status: { $in: ['en cours', 'à venir'] }
            });

            // Si on trouve au moins une session, on bloque la mise à jour
            if (sessionsActives.length > 0) {
                res.status(400); // 400 Bad Request, car la demande est invalide dans l'état actuel
                throw new Error("Ce lieu ne peut pas être désactivé car il est utilisé dans des sessions en cours ou à venir.");
            }
        }
        // --- FIN DU BLOC DE VÉRIFICATION ---


        // Si c'est le lieu par défaut, on ne peut modifier que le statut (logique existante)
        if (lieu.isDefault) {
            lieu.statut = statut || lieu.statut;
        } else {
            // Sinon, on met à jour tous les champs fournis
            lieu.nom = nom || lieu.nom;
            lieu.adresse = adresse || lieu.adresse;
            lieu.capacite = capacite ?? lieu.capacite;
            lieu.emailContact = emailContact || lieu.emailContact;
            lieu.nomContact = nomContact || lieu.nomContact;
            lieu.description = description || lieu.description;
            lieu.moyenAcces = moyenAcces || lieu.moyenAcces;
            lieu.prixParJour = prixParJour ?? lieu.prixParJour;
            lieu.prixParDemiJournee = prixParDemiJournee ?? lieu.prixParDemiJournee;
            lieu.statut = statut || lieu.statut;
            lieu.proprietaireLocaux = proprietaireLocaux ?? lieu.proprietaireLocaux;
        }

        const updatedLieu = await lieu.save();
        res.json(updatedLieu);

    } else {
        res.status(404);
        throw new Error('Lieu non trouvé');
    }
});

/**
 * @desc    Supprimer un lieu
 * @route   DELETE /api/lieux/:id
 * @access  Privé (Ecole, Admin)
 */
export const deleteLieu = asyncHandler(async (req, res) => {
    const lieu = await Lieu.findById(req.params.id);

    if (lieu) {
        // --- MODIFICATION DE LA VÉRIFICATION DES PERMISSIONS ---
        const isOwner = lieu.ecole.toString() === req.user.associatedEntity?.toString();
        const isAdmin = req.user.role === 'admin';

        // L'utilisateur doit être soit admin, soit propriétaire du lieu.
        if (!isAdmin && !isOwner) {
            res.status(403);
            throw new Error("Accès non autorisé à supprimer ce lieu.");
        }
        // --- FIN DE LA MODIFICATION ---

        // On ne peut pas supprimer le lieu par défaut
        if (lieu.isDefault) {
            res.status(400);
            throw new Error("Le lieu par défaut 'Distanciel' ne peut pas être supprimé.");
        }

        // --- NOUVEAU BLOC DE VÉRIFICATION ---
        // Chercher s'il existe des sessions 'en cours' ou 'à venir' utilisant ce lieu
        const sessionsActives = await Session.find({
            lieu: lieu._id,
            status: { $in: ['en cours', 'à venir'] }
        });

        // Si on trouve au moins une session, on bloque la suppression
        if (sessionsActives.length > 0) {
            res.status(400);
            throw new Error("Ce lieu ne peut pas être supprimé car il est utilisé dans des sessions en cours ou à venir.");
        }
        // --- FIN DU BLOC DE VÉRIFICATION ---

        await lieu.deleteOne(); // Utiliser deleteOne() est la méthode moderne
        res.json({ message: 'Lieu supprimé avec succès' });

    } else {
        res.status(404);
        throw new Error('Lieu non trouvé');
    }
});
