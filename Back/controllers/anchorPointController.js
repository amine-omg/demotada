// backend/controllers/anchorPointController.js
import AnchorPoint from '../models/AnchorPoint.js';

export const upsertAnchor = async (req, res) => {
  try {
    const { templateId, fieldId, rotationSettings, alignmentSettings, anchorStrategy } = req.body;

    const anchor = await AnchorPoint.findOneAndUpdate(
      { templateId, fieldId },
      { rotationSettings, alignmentSettings, anchorStrategy },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Ancrage géométrique mis à jour.",
      anchor
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAnchorByField = async (req, res) => {
  try {
    const { templateId, fieldId } = req.params;
    const anchor = await AnchorPoint.findOne({ templateId, fieldId });
    if (!anchor) return res.status(404).json({ message: "Ancrage par défaut (0°)." });
    res.status(200).json(anchor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};