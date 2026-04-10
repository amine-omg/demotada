import Support from '../models/Support.js';
import Chapter from '../models/Chapter.js';

export const createSupport = async (req, res) => {
    try {
        const { title, formation, chapter } = req.body;
        
        // La validation reste la même, c'est parfait.
        if (!title || !formation || !chapter) {
            return res.status(400).json({ message: "Titre, formation et chapitre sont requis." });
        }

        // On ne met que les informations nécessaires.
        // Les valeurs par défaut comme `resourceUrl`, `resourceType` et `isOptionalForCompletion`
        // seront automatiquement ajoutées par votre modèle `Support.js`.
        const newSupport = new Support({ 
            title,
            formation,
            chapter,
            createdBy: req.user._id 
        });
        
        const savedSupport = await newSupport.save();
        await Chapter.findByIdAndUpdate(chapter, { $push: { contents: savedSupport._id } });
        
        res.status(201).json(savedSupport);

    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création du support", error: error.message });
    }
};

// Obtenir un support par ID
export const getSupportById = async (req, res) => {
    try {
        const support = await Support.findById(req.params.id);
        if (!support) return res.status(404).json({ message: "Support non trouvé" });
        res.status(200).json(support);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Mettre à jour un support
export const updateSupport = async (req, res) => {
    try {
        const updatedSupport = await Support.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!updatedSupport) return res.status(404).json({ message: "Support non trouvé" });
        res.status(200).json(updatedSupport);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

export const deleteSupport = async (req, res) => {
    try {
        const support = await Support.findById(req.params.id);
        if (!support) {
            return res.status(404).json({ message: "Support non trouvé" });
        }
        
        // On retire la référence du support du tableau 'contents' du chapitre parent
        await Chapter.findByIdAndUpdate(support.chapter, {
            $pull: { contents: support._id }
        });

        // On supprime le document support lui-même
        await support.deleteOne();
        
        res.status(200).json({ message: "Support supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};