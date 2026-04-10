import FontAsset from '../models/FontAsset.js';

// @desc    Enregistrer une nouvelle police détectée
// @route   POST /api/fonts
export const registerFont = async (req, res) => {
    try {
        const { templateId, name, family, weight, style, isEmbedded } = req.body;

        const font = await FontAsset.create({
            templateId,
            name,      // ex: "Roboto-Bold"
            family,    // ex: "Roboto"
            weight,    // ex: "700"
            style,     // ex: "italic"
            isEmbedded // true si la police est extraite du PDF
        });

        res.status(201).json(font);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer toutes les polices d'un template (pour le rendu Front)
// @route   GET /api/fonts/template/:templateId
export const getTemplateFonts = async (req, res) => {
    try {
        const fonts = await FontAsset.find({ templateId: req.params.templateId });
        res.json(fonts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};