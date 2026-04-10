import Incident from '../models/Incident.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js'; 
import Ecole from '../models/Ecole.js';

/**
 * @desc    Créer un nouvel incident (soit par l'élève, soit par l'admin via dashboard)
 */
export const createIncident = async (req, res) => {
  try {
    const { type, titre, description, contexte, apprenantEmail, formationId, sessionId } = req.body;

    if (!type || !titre || !description) {
      return res.status(400).json({ message: 'Veuillez fournir un type, un titre et une description.' });
    }

    let apprenantId = null;

    // 1. Recherche de l'apprenant si un email est fourni (cas création par Admin)
    if (apprenantEmail) {
      const emailNormalise = apprenantEmail.trim().toLowerCase();
      const apprenant = await User.findOne({ email: emailNormalise });
      
      if (!apprenant) {
        return res.status(404).json({ message: `Aucun apprenant trouvé avec l'email ${apprenantEmail}` });
      }
      apprenantId = apprenant._id;
    }

    // 2. Construction du contexte dynamique
    const finalContexte = contexte || {};
    if (formationId) finalContexte.formation = formationId;
    if (sessionId) finalContexte.session = sessionId;

    // 3. Logique d'assignation automatique (Workflow Qualité)
    // Si c'est un admin ou une école qui crée, on lui assigne le ticket par défaut
    const isStaff = ['admin', 'ecole'].includes(req.user.role);

    const newIncident = new Incident({
      tenant: req.tenant ? req.tenant._id : undefined, // Sécurité Multitenancy
      createur: req.user._id, 
      responsable: isStaff ? req.user._id : null, // Assignation auto si staff
      apprenantConcerne: apprenantId || (isStaff ? null : req.user._id), 
      type,
      titre,
      description,
      contexte: finalContexte
    });

    const savedIncident = await newIncident.save();

    // 4. Logique de Notification (Exigence Qualiopi)
    // Si l'incident est créé par un apprenant, on notifie la direction de l'école
    if (!isStaff) {
      // On identifie l'école (via le tenant ou l'entité de l'utilisateur)
      const queryEcole = req.tenant ? { _id: req.tenant._id } : { _id: req.user.associatedEntity };
      const ecole = await Ecole.findOne(queryEcole);

      if (ecole && ecole.administrateurs && ecole.administrateurs.length > 0) {
        // On crée une notification pour chaque administrateur de l'école
        const notifications = ecole.administrateurs.map(adminId => ({
          recipient: adminId,
          sender: req.user._id,
          type: 'system_alert',
          message: `Nouvel incident Qualité signalé : ${titre}`,
          link: `/admin/incidents`, // Redirection vers le tableau de bord
        }));
        
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json(savedIncident);
  } catch (error) {
    console.error('Erreur lors de la création de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du ticket.' });
  }
};

export const getEcoleAdmins = async (req, res) => {
  try {
    // On identifie l'école (via le tenant ou l'entité de l'admin connecté)
    const ecoleId = req.tenant ? req.tenant._id : req.user.associatedEntity;
    
    if (!ecoleId) {
      return res.status(400).json({ message: "Impossible d'identifier l'établissement." });
    }

    // On récupère l'école et on peuple la liste des administrateurs
    const ecole = await Ecole.findById(ecoleId).populate('administrateurs', 'prenom nom email photo');
    
    if (!ecole) {
      return res.status(404).json({ message: "Établissement non trouvé." });
    }

    res.status(200).json(ecole.administrateurs || []);
  } catch (error) {
    console.error("Erreur getEcoleAdmins:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du staff." });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const query = {};
    if (req.tenant) {
      query.tenant = req.tenant._id; 
    }

    if (req.query.statut) query.statut = req.query.statut;
    if (req.query.type) query.type = req.query.type;
    
    const incidents = await Incident.find(query)
      .populate('createur', 'prenom nom email role') 
      .populate('apprenantConcerne', 'prenom nom email') 
      .populate('contexte.formation', 'title') 
      .populate('contexte.session', 'title')
      .populate('axeAmelioration', 'titre statut')
      // --- AJOUT CRUCIAL ICI POUR LE TABLEAU PRINCIPAL ---
      .populate('responsable', 'prenom nom email photo') 
      .sort({ createdAt: -1 });

    res.status(200).json(incidents);
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
export const getIncidentById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.tenant) query.tenant = req.tenant._id; // <-- SÉCURITÉ ICI

    const incident = await Incident.findOne(query)
      .populate('createur', 'prenom nom email role')
      .populate('apprenantConcerne', 'prenom nom email')
      .populate('contexte.formation', 'title')
      .populate('contexte.session', 'title')
      .populate('contexte.chapitre', 'title')
      .populate('contexte.module', 'name')
      .populate('contexte.activite', 'title type')
      .populate('axeAmelioration', 'titre statut')
      .populate('actionsCorrectives.responsable', 'prenom nom');

    if (!incident) {
      return res.status(404).json({ message: 'Incident introuvable.' });
    }

    res.status(200).json(incident);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const updateIncident = async (req, res) => {
  try {
    // On récupère le responsable dans le body
    const { statut, gravite, nature, cause, axeAmelioration, responsable } = req.body; 
    
    const query = { _id: req.params.id };
    if (req.tenant) query.tenant = req.tenant._id;

    const updatedIncident = await Incident.findOneAndUpdate(
      query,
      { 
        $set: { 
          ...(statut && { statut }),
          ...(gravite && { gravite }),
          ...(nature && { nature }),
          ...(cause && { cause }),
          ...(axeAmelioration !== undefined && { axeAmelioration }),
          ...(responsable !== undefined && { responsable }) 
        } 
      },
      { new: true, runValidators: true }
    )
    .populate('axeAmelioration', 'titre statut')
    .populate('responsable', 'prenom nom email photo')
    .populate('createur', 'prenom nom email role')
    .populate('apprenantConcerne', 'prenom nom email');

    if (!updatedIncident) {
      return res.status(404).json({ message: 'Incident introuvable.' });
    }

    res.status(200).json(updatedIncident);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const addCorrectiveAction = async (req, res) => {
  try {
    const { description, dateMiseEnOeuvre } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'La description de l\'action est requise.' });
    }

    const action = {
      description,
      dateMiseEnOeuvre: dateMiseEnOeuvre || Date.now(),
      responsable: req.user._id 
    };

    const query = { _id: req.params.id };
    if (req.tenant) query.tenant = req.tenant._id; // <-- SÉCURITÉ ICI

    const incident = await Incident.findOneAndUpdate(
      query,
      { $push: { actionsCorrectives: action } },
      { new: true }
    ).populate('actionsCorrectives.responsable', 'prenom nom');

    if (!incident) {
      return res.status(404).json({ message: 'Incident introuvable.' });
    }

    res.status(200).json(incident);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'action corrective:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const getIncidentStats = async (req, res) => {
  try {
    const matchQuery = {};
    if (req.tenant) matchQuery.tenant = req.tenant._id; // <-- SÉCURITÉ ICI

    const stats = await Incident.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$statut', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          bySeverity: [
            { $group: { _id: '$gravite', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.tenant) query.tenant = req.tenant._id; // <-- SÉCURITÉ ICI

    const incident = await Incident.findOneAndDelete(query);

    if (!incident) {
      return res.status(404).json({ message: 'Incident introuvable.' });
    }

    res.status(200).json({ message: 'Incident supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};