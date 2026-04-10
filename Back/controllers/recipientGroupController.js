import RecipientGroup from '../models/RecipientGroup.js';

// Créer un groupe de destinataires
export const createRecipientGroup = async (req, res) => {
    try {
        const { tenantId, name, members } = req.body; // members: Array d'emails/noms

        const group = new RecipientGroup({
            tenantId,
            name,
            members,
            signingStrategy: 'anyone_can_sign' // 'anyone' ou 'all'
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lister les groupes pour un client
export const getRecipientGroups = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const groups = await RecipientGroup.find({ tenantId });
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};