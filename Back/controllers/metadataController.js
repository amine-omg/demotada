// backend/controllers/metadataController.js
import Metadata from '../models/Metadata.js';

export const upsertMetadata = async (req, res) => {
  try {
    const { templateId, sourceMetadata, canvasSettings, pages, compliance } = req.body;

    const meta = await Metadata.findOneAndUpdate(
      { templateId },
      { sourceMetadata, canvasSettings, pages, compliance },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Métadonnées et système de coordonnées figés.",
      meta
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getMetadataByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const meta = await Metadata.findOne({ templateId });
    if (!meta) return res.status(404).json({ message: "Métadonnées introuvables." });
    res.status(200).json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};