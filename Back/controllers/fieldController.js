import Field from '../models/Field.js';

// @desc    Mettre à jour un champ (coordonnées ou type)
// @route   PUT /api/fields/:id
export const updateField = async (req, res) => {
    try {
        const field = await Field.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!field) {
            return res.status(404).json({ message: "Champ introuvable." });
        }

        res.json({ message: "Champ mis à jour", field });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Supprimer un champ (si erreur de détection)
// @route   DELETE /api/fields/:id
export const deleteField = async (req, res) => {
    try {
        const field = await Field.findByIdAndDelete(req.params.id);
        if (!field) return res.status(404).json({ message: "Champ introuvable." });

        res.json({ message: "Champ supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};