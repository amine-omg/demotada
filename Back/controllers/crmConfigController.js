import CrmConfig from '../models/CrmConfig.js';

// Configurer les étapes du pipeline et les préférences CRM
export const upsertCrmConfig = async (req, res) => {
    try {
        const { tenantId, pipelineStages, defaultCurrency, customFields } = req.body;

        const config = await CrmConfig.findOneAndUpdate(
            { tenantId },
            { 
                pipelineStages, // Array de { label, value, color }
                defaultCurrency, 
                customFields,   // Champs personnalisés à afficher dans l'UI CRM
                updatedAt: Date.now() 
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ message: "Configuration CRM mise à jour.", config });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer la config pour construire l'interface de suivi
export const getCrmConfig = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const config = await CrmConfig.findOne({ tenantId });
        
        if (!config) return res.status(404).json({ message: "Config CRM non trouvée." });
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};