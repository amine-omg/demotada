// backend/controllers/annexController.js
import AnnexPage from '../models/AnnexPage.js';

// Récupérer les fichiers d'annexes prêts pour la fusion
export const getAnnexFiles = async (req, res) => {
  try {
    const { templateId } = req.params;
    const annexes = await AnnexPage.find({ templateId })
      .select('staticFileUrl sequenceOrder contentSource')
      .sort({ sequenceOrder: 1 });
    
    res.status(200).json(annexes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour l'ordre de fusion (Drag & Drop dans Vue.js)
export const updateAnnexOrder = async (req, res) => {
  try {
    const { orders } = req.body; // Array de { id, sequenceOrder }
    
    const updates = orders.map(item => 
      AnnexPage.findByIdAndUpdate(item.id, { sequenceOrder: item.sequenceOrder })
    );
    await Promise.all(updates);

    res.status(200).json({ message: "Ordre des annexes mis à jour." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Upload un nouveau fichier d'annexe (Requis par tes routes pour éviter le crash)
export const uploadAnnexFile = async (req, res) => {
  try {
    // Logique simplifiée pour l'instant (à adapter selon ton middleware de stockage ex: Multer)
    const { templateId, staticFileUrl, sequenceOrder } = req.body;
    
    const newAnnex = new AnnexPage({
      templateId,
      staticFileUrl,
      sequenceOrder,
      contentSource: 'static'
    });

    await newAnnex.save();
    res.status(201).json({ message: "Fichier d'annexe enregistré.", annex: newAnnex });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};