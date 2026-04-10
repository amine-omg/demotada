// backend/controllers/customFieldController.js
import CustomFieldDefinition from '../models/CustomFieldDefinition.js';

// @desc    Créer un nouveau type de champ personnalisé
// @route   POST /api/custom-fields
export const createCustomField = async (req, res) => {
    try {
        const { name, label, type, validationRuleId, organizationId, description } = req.body;

        const customField = await CustomFieldDefinition.create({
            name,                // ex: "matricule_interne"
            label,               // ex: "Numéro de matricule"
            type,                // ex: "text", "number", "date"
            validationRuleId,    // Lien vers une DataValidationRule (ex: regex matricule)
            organizationId,
            description
        });

        res.status(201).json(customField);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer tous les champs personnalisés d'une organisation
// @route   GET /api/custom-fields/org/:orgId
export const getOrgCustomFields = async (req, res) => {
    try {
        const fields = await CustomFieldDefinition.find({ 
            $or: [{ organizationId: req.params.orgId }, { organizationId: null }] 
        }).populate('validationRuleId');
        
        res.json(fields);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Supprimer un type de champ personnalisé
// @route   DELETE /api/custom-fields/:id
export const deleteCustomField = async (req, res) => {
    try {
        await CustomFieldDefinition.findByIdAndDelete(req.params.id);
        res.json({ message: "Définition de champ supprimée" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};