// backend/controllers/validationController.js
import Validation from '../models/Validation.js';

// Cette fonction doit s'appeler exactement comme dans le fichier de routes
export const createValidationRule = async (req, res) => {
  try {
    const { fieldId, regex, errorMessage, tenantId } = req.body;
    const rule = new Validation({ fieldId, regex, errorMessage, tenantId });
    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTenantValidations = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const rules = await Validation.find({ tenantId });
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};