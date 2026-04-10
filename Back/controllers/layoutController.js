import PageLayout from '../models/PageLayout.js';
import VectorGraphic from '../models/VectorGraphic.js';
import Template from '../models/Template.js';

// @desc    Analyse les métadonnées techniques du PDF (Dimensions, PPI, etc.)
// @route   POST /api/layout
export const analyzeLayout = async (req, res) => {
  try {
    const { templateId } = req.body;
    console.log("⚙️ Analyse Layout enclenchée pour le template ID:", templateId);

    // On simule les données de l'analyse physique du PDF que le front attend
    const details = {
      sourceMetadata: {
        producer: "Karnain AI Engine",
        createDate: `D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`
      },
      fileInfo: {
        pdfVersion: "1.7",
        filesize: "128 KB",
        isLinearized: true,
        pageCount: 1,
        checksum: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" // Fake Hash
      },
      images: [
        { xPpi: 300 }, // Simulera la Raster Quality à 300 DPI
        { xPpi: 150 }
      ],
      pages: [
        { width: 210, height: 297, orientation: "Portrait" } // Format A4 classique
      ]
    };

    // On met à jour le statut en base
    await Template.findByIdAndUpdate(templateId, { 
        'progress.layout': 'complete' 
    });

    res.status(200).json({ 
      success: true, 
      message: "Analyse du layout terminée",
      details: details 
    });

  } catch (error) {
    console.error("❌ Erreur analyse layout :", error);
    res.status(500).json({ message: "Erreur analyse layout" });
  }
};

// @desc    Récupérer la structure visuelle complète d'un template
// @route   GET /api/layout/template/:templateId
export const getFullLayout = async (req, res) => {
    try {
        const { templateId } = req.params;
        const pages = await PageLayout.find({ templateId }).sort({ pageNumber: 1 });
        const vectors = await VectorGraphic.find({ templateId });

        res.json({
            pages,
            vectors,
            totalFeedback: "Structure visuelle récupérée"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enregistrer un tracé vectoriel détecté
// @route   POST /api/layout/vectors
export const addVector = async (req, res) => {
    try {
        const vector = await VectorGraphic.create(req.body);
        res.status(201).json(vector);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};