// backend/controllers/documentPatchController.js
import DocumentPatch from '../models/DocumentPatch.js';

// Appliquer une modification chirurgicale sur un document
export const applyPatch = async (req, res) => {
  try {
    const { documentId, fieldId, newValue, author } = req.body;
    
    const patch = new DocumentPatch({
      documentId,
      fieldId,
      newValue,
      author,
      appliedAt: Date.now()
    });

    await patch.save();
    res.status(201).json({ message: "Correctif appliqué au document.", patch });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer l'historique des patchs pour reconstruire le document final
export const getPatchesByDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const patches = await DocumentPatch.find({ documentId }).sort({ appliedAt: 1 });
    res.status(200).json(patches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Annuler une modification spécifique (La fonction qui manquait !)
export const revertPatch = async (req, res) => {
  try {
    const { patchId } = req.params;
    const deletedPatch = await DocumentPatch.findByIdAndDelete(patchId);
    
    if (!deletedPatch) {
      return res.status(404).json({ message: "Correctif introuvable." });
    }

    res.status(200).json({ message: "Modification annulée avec succès." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};