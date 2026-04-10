import Ecole from '../models/Ecole.js'; // Correction: utilisation de 'import'
import axios from 'axios'; // N'oubliez pas d'importer axios
import { nanoid } from 'nanoid'; // Importer nanoid ici aussi
import CrmConfig from '../models/CrmConfig.js'; // <-- 1. AJOUTER CET IMPORT
import User from '../models/User.js';
import Formation from '../models/Formation.js';
import Lieu from '../models/Lieu.js';
import EmailTemplate from '../models/EmailTemplate.js';

export const createEcole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Vérification de sécurité : un utilisateur de type 'ecole' ne peut créer qu'un seul établissement
    if (user.role === 'ecole' && user.associatedEntity) {
      return res.status(400).json({ message: "Vous êtes déjà lié à un établissement." });
    }

    // 1. Création de l'école
    const nouvelleEcole = new Ecole({
      nom: req.body.nom,
      administrateurs: [req.user._id]
    });
    await nouvelleEcole.save();

    await Lieu.createDefaultLieuForEcole(nouvelleEcole._id);

        await EmailTemplate.createDefaultTemplatesForEcole(nouvelleEcole._id);

    // 2. Création de la configuration CRM par défaut pour cette nouvelle école
    const defaultConfig = new CrmConfig({
      ecole: nouvelleEcole._id,
      pipelineStages: [
        { name: 'Entrant', order: 0 },
        { name: 'Contacté', order: 1 },
        { name: 'Rendez-vous', order: 2 },
        { name: 'Devis envoyé', order: 3 },
        { name: 'Négociation', order: 4 },
      ],
      lossReasons: ['Prix trop élevé', 'Parti à la concurrence', 'Pas de nouvelles']
    });
    await defaultConfig.save();

    // 3. Liaison de l'école à l'utilisateur qui l'a créée
    user.associatedEntity = nouvelleEcole._id;
    await user.save();
    
    // 4. On renvoie l'école fraîchement créée
    res.status(201).json(nouvelleEcole);

  } catch (error) {
    // En cas d'erreur, on logue le détail sur le serveur pour le débogage
    console.error("ERREUR LORS DE LA CRÉATION DE L'ÉTABLISSEMENT :", error);
    // Et on renvoie une erreur 500 claire
    res.status(500).json({ message: "Impossible de créer l'établissement, une erreur est survenue.", error: error.message });
  }
};

export const getEcolesListForAdmin = async (req, res) => {
  try {
    // On ne sélectionne que l'ID et le nom pour une réponse légère
    const ecoles = await Ecole.find({}).select('_id nom').sort({ nom: 1 });
    res.status(200).json(ecoles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la liste des écoles.", error: error.message });
  }
};

/**
 * @desc    Récupérer toutes les écoles
 * @route   GET /api/ecoles
 * @access  Privé
 */
export const getAllEcoles = async (req, res) => {
  try {
    const ecoles = await Ecole.find({});
    res.status(200).json(ecoles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getMesEtablissements = async (req, res) => {
  try {
    // On cherche les établissements où l'ID de l'utilisateur connecté
    // figure dans le tableau des administrateurs.
    const ecoles = await Ecole.find({ administrateurs: req.user._id });
    res.status(200).json(ecoles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


export const getEcoleById = async (req, res) => {
  try {
    // 1. On garde ton findById mais on ajoute le populate pour l'équipe de direction
    const ecole = await Ecole.findById(req.params.id)
      .populate('administrateurs', 'prenom nom email photo'); 

    if (!ecole) {
      return res.status(404).json({ message: "École non trouvée" });
    }

    // 2. On garde ta logique de génération de crmId à l'identique
    if (!ecole.crmId) {
      console.log(`Génération d'un crmId pour l'établissement existant : ${ecole.nom}`);
      ecole.crmId = nanoid(12);
      await ecole.save();
    }

    // 3. On garde ta logique CRM Managers en ajoutant juste 'photo' pour le design
    const crmConfig = await CrmConfig.findOne({ ecole: ecole._id })
                                     .populate('managers', 'nom prenom email photo'); 

    const ecoleObject = ecole.toObject();
    
    // On attache les managers comme tu le faisais
    ecoleObject.crmManagers = crmConfig ? crmConfig.managers : [];

    res.status(200).json(ecoleObject); 

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @desc    Mettre à jour une école (données générales + gestion des accès)
 * @route   PUT /api/ecoles/:id
 * @access  Privé (Admin / Ecole)
 */
export const updateEcole = async (req, res) => {
  try {
    // 1. On sépare le champ spécial 'addAdminByEmail' du reste des données
    const { addAdminByEmail, ...otherData } = req.body;
    
    // On prépare l'objet de mise à jour standard
    let updateQuery = { $set: otherData };

    // 2. LOGIQUE D'AJOUT D'UN ADMINISTRATEUR
    if (addAdminByEmail) {
      // Normalisation de l'email pour éviter les erreurs de casse
      const emailNormalise = addAdminByEmail.toLowerCase().trim();
      
      // Recherche de l'utilisateur dans la base globale
      const userToAdd = await User.findOne({ email: emailNormalise });
      
      if (!userToAdd) {
        return res.status(404).json({ 
          message: `Aucun utilisateur trouvé avec l'adresse : ${addAdminByEmail}` 
        });
      }

      // Utilisation de $addToSet pour ajouter l'ID uniquement s'il n'est pas déjà présent
      // Cela évite les doublons dans ton équipe de direction.
      updateQuery = { 
        ...updateQuery, 
        $addToSet: { administrateurs: userToAdd._id } 
      };
    }

    // 3. EXÉCUTION DE LA MISE À JOUR
    const ecole = await Ecole.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true, runValidators: true }
    ).populate('administrateurs', 'prenom nom email photo'); // CRUCIAL pour l'affichage Front

    if (!ecole) {
      return res.status(404).json({ message: "Établissement introuvable." });
    }

    // 4. RETOUR DES DONNÉES PEUPLÉES
    // Le Front reçoit l'objet complet avec les noms et photos, plus de "cases vides"
    res.status(200).json(ecole);

  } catch (error) {
    console.error("Erreur détaillée lors de l'update de l'école :", error);
    res.status(400).json({ 
      message: "Erreur lors de la mise à jour de l'établissement", 
      error: error.message 
    });
  }
};

export const regenerateCrmId = async (req, res) => {
    try {
        const ecole = await Ecole.findById(req.params.id);
        if (!ecole) {
            return res.status(404).json({ message: 'École non trouvée.' });
        }

        ecole.crmId = nanoid(12); // Génère un nouvel ID
        await ecole.save();

        res.status(200).json(ecole);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la régénération de l\'ID CRM.', error });
    }
};


/**
 * @desc    Supprimer une école
 * @route   DELETE /api/ecoles/:id
 * @access  Privé (Admin)
 */
export const deleteEcole = async (req, res) => {
  try {
    const ecole = await Ecole.findById(req.params.id);
     if (!ecole) {
      return res.status(404).json({ message: "École non trouvée" });
    }

    // Ici, vous pourriez ajouter la logique pour retirer les références
    // de cette école dans d'autres documents si nécessaire.

    await ecole.deleteOne();

    res.status(200).json({ message: "École supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @desc    Récupérer les formations rattachées à un établissement
 * @route   GET /api/ecoles/:id/formations
 * @access  Privé (Admin, Ecole)
 */
export const getFormationsForEcole = async (req, res) => {
  try {
    const formations = await Formation.find({ ecole: req.params.id })
                                      .select('title status');
    
    // La vérification !formations est redondante si .find() retourne un array vide
    // On peut la simplifier.
    res.status(200).json(formations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getExternalFormationsBySiret = async (req, res) => {
    try {
        const { siret } = req.params;
        if (!siret || siret.length !== 14) {
            return res.status(400).json({ message: "Un numéro de SIRET valide (14 chiffres) est requis." });
        }

        const OPENDATA_API_URL = 'https://opendata.caissedesdepots.fr/api/explore/v2.1/catalog/datasets/moncompteformation_catalogueformation/records';
        const API_HEADERS = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        const params = {
            select: "intitule_formation, nom_of, code_rncp, objectif_formation, contenu_formation, points_forts, siret",
            where: `siret = "${siret}"`,
            limit: 100,
        };

        const apiResponse = await axios.get(OPENDATA_API_URL, {
            params,
            headers: API_HEADERS
        });

        res.status(200).json(apiResponse.data.results);

    } catch (error) {
        console.error("Erreur lors de la recherche par SIRET :", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erreur lors de la communication avec l'API Open Data" });
    }
};