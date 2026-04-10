import CrmConfig from '../models/CrmConfig.js'; 
import Opportunite from '../models/Opportunite.js'; 
import Ecole from '../models/Ecole.js'; 
import User from '../models/User.js'; 
import Prospect from '../models/Prospect.js';

export const getCrmConfig = async (req, res) => {
    const ecoleId = req.query.ecoleId || req.user.associatedEntity;

    if (!ecoleId) {
        return res.status(400).json({ message: "ID d'école manquant pour accéder au CRM." });
    }

    try {
        let config = await CrmConfig.findOne({ ecole: ecoleId }).populate('ecole', 'nom').populate('managers');

        if (!config) {
            return res.status(404).json({ message: "Aucune configuration CRM trouvée pour cette école. Veuillez en créer une ou en lier une existante." });
        }

        const isManager = config.managers && config.managers.some(manager => manager._id.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin';
        const isEcoleOrEntreprise = req.user.role === 'ecole' || req.user.role === 'entreprise';

        if (!isManager && !isAdmin && !isEcoleOrEntreprise) {
            return res.status(403).json({ message: "Accès non autorisé à ce CRM. Vous n'êtes ni manager, ni administrateur de cette configuration." });
        }
        
        res.status(200).json(config);

    } catch (err) {
        console.error("Erreur dans getCrmConfig:", err);
        res.status(500).json({ message: 'Erreur Serveur lors de la récupération de la config CRM.' });
    }
};


export const verifyCrmLink = async (req, res) => {
    const { ecoleId, crmId } = req.body;
    const userId = req.user.id; 

    if (!ecoleId || !crmId) {
        return res.status(400).json({ message: 'L\'ID de l\'école et l\'ID CRM sont requis.' });
    }

    try {
        const ecole = await Ecole.findById(ecoleId);
        // Vérifie si l'école existe et si l'ID CRM fourni correspond à celui de l'école
        if (!ecole || ecole.crmId !== crmId) {
            return res.status(403).json({ message: 'L\'ID CRM fourni est incorrect pour cet établissement.' });
        }

        let crmConfig = await CrmConfig.findOne({ ecole: ecoleId });

        if (!crmConfig) {
            console.log("Creating new CRM config with default stages for ecoleId:", ecoleId);
            crmConfig = new CrmConfig({
                ecole: ecoleId,
                managers: [userId], // L'utilisateur actuel devient le premier manager
                pipelineStages: [
                    { name: 'Entrant', order: 0 },
                    { name: 'Discussion', order: 1 },
                    { name: 'Devis', order: 2 },
                    { name: 'Convention', order: 3 },
                    { name: 'Facture', order: 4 }
                ],
                lossReasons: [
                    'Tarif trop élevé',
                    'Financement externe non accordé',
                    'Dates incompatibles',
                    'Programme inapproprié',
                    'Formation réalisée chez un concurrent'
                ]
            });
            await crmConfig.save();
            console.log("New CRM config created:", crmConfig);
        } else {
            // Si la config existe déjà, ajoute l'utilisateur comme manager si ce n'est pas déjà fait
            if (!crmConfig.managers.includes(userId)) {
                crmConfig.managers.push(userId);
                await crmConfig.save();
            }
        }

        // MISE À JOUR CRUCIALE : Mettre à jour l'associatedEntity de l'utilisateur
        // Ceci est essentiel pour que les requêtes futures (via req.user.associatedEntity)
        // trouvent la bonne configuration CRM.
        const user = await User.findById(userId);
        if (user && user.associatedEntity?.toString() !== ecoleId) {
            user.associatedEntity = ecoleId;
            await user.save();
        }

        res.status(200).json({
            message: 'Liaison vérifiée et CRM configuré. Le pipeline va se charger.',
            ecoleId: ecole._id, // Retourne l'ID de l'école liée
            crmConfigId: crmConfig._id // Retourne l'ID de la config CRM
        });
    } catch (error) {
        console.error("Erreur serveur lors de la vérification de la liaison CRM:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la vérification de la liaison CRM.' });
    }
};


export const updateCrmConfig = async (req, res) => {
    const { pipelineStages, lossReasons } = req.body;
    const ecoleId = req.query.ecoleId || req.user.associatedEntity; // Assurez-vous d'avoir l'ecoleId

    if (!ecoleId) {
        return res.status(400).json({ message: "ID d'école manquant pour mettre à jour la config CRM." });
    }

    try {
        const updatedConfig = await CrmConfig.findOneAndUpdate(
            { ecole: ecoleId }, // Recherche par l'ID de l'école
            { $set: { pipelineStages, lossReasons } },
            { new: true }
        );
        if (!updatedConfig) {
            return res.status(404).json({ message: "Configuration CRM non trouvée pour mise à jour." });
        }
        res.status(200).json(updatedConfig);
    } catch (err) {
        console.error("Erreur dans updateCrmConfig:", err);
        res.status(500).json({ message: 'Erreur Serveur lors de la mise à jour de la config CRM.' });
    }
};

export const getOpportunites = async (req, res) => {
    try {
        const ecoleId = req.query.ecoleId || req.user.associatedEntity; // Utilise req.query.ecoleId en priorité
        if (!ecoleId) {
            return res.status(400).json({ message: "ID d'école manquant pour récupérer les opportunités." });
        }

        const query = { ecole: ecoleId };

        if (req.query.search) {
            query.nomOpportunite = new RegExp(req.query.search, 'i');
        }
        if (req.query.gestionnaireId) {
            query.proprietaire = req.query.gestionnaireId;
        }
        if (req.query.statut) {
            query.statutOpportunite = req.query.statut;
        }
        if (req.query.typeClient) {
            query.typeBusiness = req.query.typeClient;
        }

        const opportunites = await Opportunite.find(query)
            .populate('proprietaire', 'nom prenom')
            .populate('apprenants', 'nom prenom')
            .populate('formation', 'title')
            .sort({ dateCreation: -1 });

        res.status(200).json(opportunites);
    } catch (err) {
        console.error("Erreur dans getOpportunites:", err);
        res.status(500).json({ message: 'Erreur Serveur lors de la récupération des opportunités.' });
    }
};

export const getMyManagedCrms = async (req, res) => {
    try {
        const userId = req.user.id;
        const configs = await CrmConfig.find({ managers: userId })
            .populate('ecole', 'nom');

        res.status(200).json(configs);
    } catch (error) {
        console.error("Erreur dans getMyManagedCrms:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des CRM gérés." });
    }
};

export const createOpportunite = async (req, res) => {
    try {
        const ecoleId = req.query.ecoleId || req.user.associatedEntity;
        if (!ecoleId) {
            return res.status(400).json({ message: "ID d'école manquant pour créer une opportunité." });
        }
        
        const newOpportunite = new Opportunite({
            ...req.body,
            proprietaire: req.user.id,
            ecole: ecoleId
        });

        // On sauvegarde d'abord la nouvelle opportunité
        const savedOpportunite = await newOpportunite.save();

        // MODIFICATION ICI : On recharge l'opportunité sauvegardée en peuplant les champs
        const populatedOpportunite = await Opportunite.findById(savedOpportunite._id)
            .populate('proprietaire', 'nom prenom')
            .populate('apprenants', 'nom prenom')
            .populate('formation', 'title');

        // On renvoie l'objet complet et peuplé
        res.status(201).json(populatedOpportunite);

    } catch (err) {
        console.error("Erreur dans createOpportunite:", err);
        res.status(500).json({ message: 'Erreur Serveur lors de la création de l\'opportunité.' });
    }
};

export const getOpportuniteById = async (req, res) => {
    try {
        const opportunite = await Opportunite.findById(req.params.id).populate([
            { path: 'proprietaire', select: 'nom prenom email' },
            { path: 'apprenants', select: 'nom prenom email photo' },
            { path: 'prospects', select: 'nom prenom email telephone' },
            { path: 'formation', select: 'title' },
            { path: 'session', select: 'title' } 
        ]);
        if (!opportunite) {
            return res.status(404).json({ message: "Opportunité non trouvée." });
        }
        res.status(200).json(opportunite);
    } catch (err) {
        console.error("Erreur dans getOpportuniteById:", err);
        res.status(500).json({ message: 'Erreur Serveur lors de la récupération de l\'opportunité.' });
    }
};

export const updateOpportunite = async (req, res) => {
    try {
        const updatedOpportunite = await Opportunite.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedOpportunite) {
            return res.status(404).json({ message: "Opportunité non trouvée pour mise à jour." });
        }
        res.status(200).json(updatedOpportunite);
    } catch (err) {
        console.error("Erreur dans updateOpportunite:", err);
        res.status(500).json({ message: 'Erreur Serveur lors de la mise à jour de l\'opportunité.' });
    }
};

export const deleteOpportunite = async (req, res) => {
    try {
        await Opportunite.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Opportunité supprimée avec succès' });
    } catch (err) {
        console.error("Erreur dans deleteOpportunite:", err);
        res.status(500).json({ message: 'Erreur Serveur lors de la suppression de l\'opportunité.' });
    }
};

export const addApprenantToOpportunite = async (req, res) => {
    try {
        const opportuniteId = req.params.id;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis." });
        }

        // 1. Chercher l'utilisateur par son email (en ignorant les majuscules/espaces)
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: "Aucun élève trouvé avec cette adresse email sur la plateforme." });
        }

        // 2. Ajouter l'utilisateur sans créer de doublon ($addToSet)
        const updatedOpp = await Opportunite.findByIdAndUpdate(
            opportuniteId,
            { $addToSet: { apprenants: user._id } },
            { new: true }
        ).populate('apprenants', 'nom prenom email'); // On peuple direct pour que le front affiche le nom

        if (!updatedOpp) {
            return res.status(404).json({ message: "Opportunité introuvable." });
        }

        res.status(200).json({ message: "Élève ajouté avec succès.", opportunite: updatedOpp });

    } catch (error) {
        console.error("Erreur addApprenantToOpportunite:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'élève." });
    }
};

export const createProspectForOpportunite = async (req, res) => {
    try {
        const opportuniteId = req.params.id;
        const { prenom, nom, email, telephone } = req.body;

        if (!email || !prenom || !nom) {
            return res.status(400).json({ message: "Le prénom, le nom et l'email sont requis." });
        }

        // 1. Récupérer l'opportunité pour savoir à quelle école lier le prospect
        const opportunite = await Opportunite.findById(opportuniteId);
        if (!opportunite) {
            return res.status(404).json({ message: "Opportunité introuvable." });
        }

        const cleanEmail = email.trim().toLowerCase();

        // 2. Par sécurité, on revérifie si l'utilisateur n'existe pas finalement 
        // (au cas où il se serait inscrit entre le moment où le commercial a cliqué et maintenant)
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            const updatedOpp = await Opportunite.findByIdAndUpdate(
                opportuniteId,
                { $addToSet: { apprenants: existingUser._id } },
                { new: true }
            )
            .populate('apprenants', 'nom prenom email photo')
            .populate('prospects', 'nom prenom email telephone');
            return res.status(200).json({ message: "Un compte a été trouvé, ajouté comme apprenant.", opportunite: updatedOpp });
        }

        // 3. Vérifier si ce prospect existe DÉJÀ dans la base de données de cette école
        let prospect = await Prospect.findOne({ email: cleanEmail, ecole: opportunite.ecole });

        // 4. S'il n'existe pas, on le crée !
        if (!prospect) {
            prospect = new Prospect({
                prenom: prenom.trim(),
                nom: nom.trim(),
                email: cleanEmail,
                telephone: telephone ? telephone.trim() : '',
                ecole: opportunite.ecole
            });
            await prospect.save();
        }

        // 5. On relie le prospect à notre opportunité (sans faire de doublon grâce à $addToSet)
        const updatedOpp = await Opportunite.findByIdAndUpdate(
            opportuniteId,
            { $addToSet: { prospects: prospect._id } },
            { new: true }
        )
        // On renvoie l'opportunité complète avec toutes ses données pour mettre à jour l'interface Vue.js
        .populate('proprietaire', 'nom prenom email')
        .populate('apprenants', 'nom prenom email photo')
        .populate('prospects', 'nom prenom email telephone') // IMPORTANT : on charge les prospects
        .populate('formation', 'title')
        .populate('session', 'title');

        res.status(201).json({ message: "Prospect créé et ajouté avec succès.", opportunite: updatedOpp });

    } catch (error) {
        console.error("Erreur createProspectForOpportunite:", error);
        res.status(500).json({ message: "Erreur serveur lors de la création du prospect." });
    }
};