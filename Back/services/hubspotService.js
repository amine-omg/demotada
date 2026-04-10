// backend/services/hubspotService.js
import axios from 'axios';

/**
 * Synchronise un contact Kernain vers HubSpot
 */
export const syncContactToHubSpot = async (contactData, accessToken) => {
    try {
        // Logique pour créer ou mettre à jour un contact dans HubSpot
        console.log(`Synchronisation du contact ${contactData.email} vers HubSpot...`);
        return { success: true, hubspotId: "12345" };
    } catch (error) {
        console.error("Erreur HubSpot Contact:", error);
        throw new Error("Échec de la synchronisation CRM.");
    }
};

/**
 * Envoie un document signé vers les pièces jointes d'un Deal HubSpot
 */
export const uploadSignedDocToDeal = async (dealId, fileUrl, accessToken) => {
    try {
        console.log(`Envoi du document vers le deal HubSpot ${dealId}...`);
        return { success: true };
    } catch (error) {
        console.error("Erreur HubSpot Upload:", error);
        throw new Error("Échec de l'envoi du document vers HubSpot.");
    }
};