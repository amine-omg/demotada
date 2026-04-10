import Signer from '../models/Signer.js';

// Ajouter un signataire à une enveloppe
export const addSignerToEnvelope = async (req, res) => {
    try {
        const { envelopeId, email, nom, prenom, order, authMethod } = req.body;

        const signer = new Signer({
            envelopeId,
            email,
            nom,
            prenom,
            order: order || 1, // Ordre de passage
            authMethod: authMethod || 'email', // 'email' or 'sms'
            status: 'waiting'
        });

        await signer.save();
        res.status(201).json(signer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Mettre à jour le statut du signataire (ex: a ouvert le lien)
export const updateSignerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'viewed', 'signed', 'declined'

        const signer = await Signer.findByIdAndUpdate(
            id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        res.status(200).json(signer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};