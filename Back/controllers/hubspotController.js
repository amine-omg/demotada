import HubSpot from '../models/HubspotConfig.js';
// Tu utiliseras le SDK @hubspot/api-client ici plus tard
import * as hubspotService from '../services/hubspotService.js'; 

// Enregistrer les accès HubSpot (Client ID / Secret ou Access Token)
export const saveHubspotConnection = async (req, res) => {
    try {
        const { tenantId, accessToken, refreshToken, portalId } = req.body;

        const connection = await HubSpot.findOneAndUpdate(
            { tenantId },
            { accessToken, refreshToken, portalId, isConnected: true, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: "HubSpot connecté avec succès.", connection });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer les données d'un Deal HubSpot pour pré-remplir un document Kernain
export const getDealData = async (req, res) => {
    try {
        const { dealId } = req.params;
        const tenantId = req.user.tenantId;

        // Appel au service qui interroge l'API HubSpot
        const dealData = await hubspotService.fetchDealFromHubspot(tenantId, dealId);
        
        res.status(200).json(dealData);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération HubSpot.", error: error.message });
    }
};