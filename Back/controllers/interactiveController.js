// backend/controllers/interactiveController.js
import InteractiveField from '../models/InteractiveField.js';

export const upsertInteractive = async (req, res) => {
  try {
    const { templateId, fieldId, fieldType, behavior, options } = req.body;

    const interactive = await InteractiveField.findOneAndUpdate(
      { templateId, fieldId },
      { fieldType, behavior, options },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Composant interactif PDF configuré.",
      interactive
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getInteractiveByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const fields = await InteractiveField.find({ templateId });
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};