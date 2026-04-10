import Blueprint from '../models/Blueprint.js';

// Créer un nouveau Blueprint (ex: Modèle de Certificat de Réalisation)
export const createBlueprint = async (req, res) => {
    try {
        const { tenantId, name, description, version, category } = req.body;

        const blueprint = new Blueprint({
            tenantId,
            name,
            description,
            version: version || "1.0.0",
            category, // 'legal', 'training', 'invoice', etc.
            status: 'draft'
        });

        await blueprint.save();
        res.status(201).json({ message: "Blueprint créé avec succès.", blueprint });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer tous les Blueprints d'un client (Tenant)
export const getBlueprintsByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const blueprints = await Blueprint.find({ tenantId }).sort({ updatedAt: -1 });
        res.status(200).json(blueprints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour le statut (ex: passer de 'draft' à 'published')
export const updateBlueprintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const blueprint = await Blueprint.findByIdAndUpdate(
            id, 
            { status, updatedAt: Date.now() }, 
            { new: true }
        );

        res.status(200).json({ message: `Blueprint passé en ${status}.`, blueprint });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};