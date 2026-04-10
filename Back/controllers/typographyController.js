// backend/controllers/typographyController.js
// IMPORTATION : On utilise 'import' et on n'oublie pas l'extension .js
import Typography from '../models/Typography.js'; 

export const getTypographyRules = async (req, res) => {
    try {
        const { tenantId } = req.query;
        // Simulation de récupération de profil
        res.status(200).json({
            hyphenation: true,
            colorMatching: true,
            defaultInk: "#003399"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTypographyConfig = async (req, res) => {
    try {
        res.status(200).json({ message: "Configuration typographique mise à jour" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};