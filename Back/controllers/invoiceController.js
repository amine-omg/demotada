import InvoiceMetadata from '../models/InvoiceMetadata.js';

// Configurer les règles de calcul financier pour un template
export const upsertInvoiceMetadata = async (req, res) => {
    try {
        const { 
            templateId, 
            currency,        // EUR, USD, etc.
            taxRules,        // Array de { label, rate, isIncluded }
            roundingStrategy, // 'up', 'down', 'nearest'
            autoCalculateTTC // Boolean
        } = req.body;

        const metadata = await InvoiceMetadata.findOneAndUpdate(
            { templateId },
            { 
                currency, 
                taxRules, 
                roundingStrategy, 
                autoCalculateTTC,
                updatedAt: Date.now() 
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            message: "Configuration comptable mise à jour.",
            metadata
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer les réglages financiers pour le moteur de rendu
export const getInvoiceMetadata = async (req, res) => {
    try {
        const { templateId } = req.params;
        const metadata = await InvoiceMetadata.findOne({ templateId });

        if (!metadata) {
            return res.status(404).json({ message: "Aucune config comptable pour ce template." });
        }

        res.status(200).json(metadata);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};