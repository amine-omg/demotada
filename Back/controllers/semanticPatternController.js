import SemanticPattern from '../models/SemanticPattern.js';

// Créer un pattern de calcul (ex: Total = Somme des lignes)
export const createPattern = async (req, res) => {
    try {
        const { name, formula, targetField, sourceFields, tenantId } = req.body;

        const pattern = new SemanticPattern({
            tenantId,
            name,           // ex: "Calcul TVA 20%"
            formula,        // ex: "{{base_ht}} * 0.20"
            targetField,    // Le champ qui reçoit le résultat
            sourceFields    // Les champs utilisés pour le calcul
        });

        await pattern.save();
        res.status(201).json(pattern);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer les patterns applicables à un document
export const getPatternsByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const patterns = await SemanticPattern.find({ tenantId });
        res.status(200).json(patterns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};