// backend/controllers/inkStyleController.js
import InkStyle from '../models/InkStyle.js';

export const upsertInkStyle = async (req, res) => {
  try {
    const { templateId, fieldId, renderingSettings, visualIntegration } = req.body;

    const style = await InkStyle.findOneAndUpdate(
      { templateId, fieldId },
      { renderingSettings, visualIntegration },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Style d'encre configuré.",
      style
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getInkStyleByField = async (req, res) => {
  try {
    const { templateId, fieldId } = req.params;
    const style = await InkStyle.findOne({ templateId, fieldId });
    if (!style) return res.status(404).json({ message: "Style d'encre par défaut." });
    res.status(200).json(style);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};