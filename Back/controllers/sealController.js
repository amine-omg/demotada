// backend/controllers/sealController.js
import Seal from '../models/Seal.js';

/**
 * @desc    Créer/Appliquer un sceau (Appelé par router.post('/') à la ligne 7)
 */
export const createSeal = async (req, res) => {
    try {
        const { tenantId, documentId } = req.body;
        
        // On récupère le cachet configuré pour l'entreprise
        const sealConfig = await Seal.findOne({ tenantId, active: true });

        if (!sealConfig) {
            return res.status(404).json({ error: "Aucun cachet actif pour cette entreprise." });
        }

        // Logique de scellement cryptographique ou enregistrement ici...
        
        res.status(200).json({ 
            message: "Cachet électronique appliqué au document.",
            sealId: sealConfig._id 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc    Récupérer les informations d'un sceau (Appelé par router.get('/:documentId'))
 */
export const getSealByDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        // Logique pour trouver le sceau lié au document
        const seal = await Seal.findOne({ documentId });

        if (!seal) {
            return res.status(404).json({ message: "Sceau introuvable pour ce document." });
        }

        res.status(200).json(seal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};