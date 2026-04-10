import Branding from '../models/Branding.js';

// Créer ou mettre à jour la charte graphique
export const upsertBranding = async (req, res) => {
    try {
        const { 
            tenantId, 
            primaryColor, 
            secondaryColor, 
            logoLightUrl, 
            logoDarkUrl, 
            faviconUrl,
            customFontFamily 
        } = req.body;

        const branding = await Branding.findOneAndUpdate(
            { tenantId },
            { 
                primaryColor, 
                secondaryColor, 
                logoLightUrl, 
                logoDarkUrl, 
                faviconUrl,
                customFontFamily,
                updatedAt: Date.now()
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            message: "Identité visuelle mise à jour.",
            branding
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer le branding pour configurer l'interface Vue.js dynamiquement
export const getBrandingByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const branding = await Branding.findOne({ tenantId });

        if (!branding) {
            return res.status(404).json({ message: "Branding par défaut appliqué." });
        }

        res.status(200).json(branding);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};