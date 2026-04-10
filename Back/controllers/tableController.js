import TableStructure from '../models/TableStructure.js';

// Créer ou mettre à jour la logique d'extraction d'un tableau
export const upsertTableStructure = async (req, res) => {
    try {
        const { 
            templateId, 
            name, 
            dataSourceKey, // ex: "deal.line_items" ou "stagiaires"
            columnsMapping, // Array de { sourceKey, targetLabel, type }
            calculations    // Formules pour les colonnes calculées (ex: HT * TVA)
        } = req.body;

        const structure = await TableStructure.findOneAndUpdate(
            { templateId, name },
            { 
                dataSourceKey, 
                columnsMapping, 
                calculations,
                updatedAt: Date.now() 
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            message: "Structure logique du tableau sauvegardée.",
            structure
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer la structure pour un template donné
export const getTableStructuresByTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const structures = await TableStructure.find({ templateId });
        res.status(200).json(structures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer une définition de tableau
export const deleteTableStructure = async (req, res) => {
    try {
        const { id } = req.params;
        await TableStructure.findByIdAndDelete(id);
        res.status(200).json({ message: "Structure de tableau supprimée." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};