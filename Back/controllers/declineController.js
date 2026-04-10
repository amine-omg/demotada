import Signer from '../models/Signer.js';
import Envelope from '../models/Envelope.js';

// Enregistrer un refus de signature
export const recordDecline = async (req, res) => {
    try {
        const { signerId } = req.params;
        const { reason } = req.body;

        const signer = await Signer.findByIdAndUpdate(
            signerId,
            { status: 'declined', declineReason: reason, updatedAt: Date.now() },
            { new: true }
        );

        // Si un signataire refuse, l'enveloppe entière passe en "void" (annulée)
        await Envelope.findByIdAndUpdate(signer.envelopeId, { status: 'void' });

        res.status(200).json({ message: "Refus enregistré. L'émetteur a été notifié.", signer });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Consulter les archives des refus
export const getDeclineRecord = async (req, res) => {
    try {
        const { envelopeId } = req.params;
        const declinedSigner = await Signer.findOne({ envelopeId, status: 'declined' });
        
        res.status(200).json(declinedSigner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};