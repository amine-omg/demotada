import Contact from '../models/Contact.js';

// Créer ou mettre à jour un contact (réutilisable pour plusieurs documents)
export const upsertContact = async (req, res) => {
    try {
        const { tenantId, email, nom, prenom, telephone, entreprise, fonction } = req.body;

        const contact = await Contact.findOneAndUpdate(
            { tenantId, email }, // Unicité basée sur l'email au sein d'un même tenant
            { nom, prenom, telephone, entreprise, fonction, updatedAt: Date.now() },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ message: "Contact synchronisé.", contact });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lister les contacts pour l'auto-complétion dans le studio
export const getContacts = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const contacts = await Contact.find({ tenantId }).sort({ nom: 1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};