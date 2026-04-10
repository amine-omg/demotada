// backend/controllers/annexManagerController.js
import AnnexPage from '../models/AnnexPage.js';

// Ajouter ou mettre à jour une configuration d'annexe
export const upsertAnnex = async (req, res) => {
  try {
    const { templateId, triggerConfig, layoutConfig, contentSource, sequenceOrder, conditionField } = req.body;

    const annex = await AnnexPage.findOneAndUpdate(
      { templateId, sequenceOrder }, // On identifie par le template et sa position
      { triggerConfig, layoutConfig, contentSource, sequenceOrder, conditionField },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Configuration de l'annexe enregistrée.",
      annex
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les annexes liées à un template (pour l'assemblage final)
export const getAnnexesByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const annexes = await AnnexPage.find({ templateId }).sort({ sequenceOrder: 1 });
    res.status(200).json(annexes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une annexe
export const deleteAnnex = async (req, res) => {
  try {
    const { id } = req.params;
    await AnnexPage.findByIdAndDelete(id);
    res.status(200).json({ message: "Annexe supprimée." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};