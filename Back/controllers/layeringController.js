// backend/controllers/layeringController.js
import Layering from '../models/Layering.js';

export const upsertLayer = async (req, res) => {
  try {
    const { templateId, fieldId, stackingOrder, layerProperties } = req.body;

    const layer = await Layering.findOneAndUpdate(
      { templateId, fieldId },
      { stackingOrder, layerProperties },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Ordre de superposition mis à jour.",
      layer
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer l'ordre complet des couches pour un template (pour le rendu séquentiel)
export const getLayersByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const layers = await Layering.find({ templateId }).sort({ stackingOrder: 1 });
    res.status(200).json(layers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};