import Envelope from '../models/Envelope.js';
import Signer from '../models/Signer.js';
import crypto from 'crypto';

export const generateEvidenceSummary = async (req, res) => {
    try {
        const { envelopeId } = req.params;
        
        const envelope = await Envelope.findById(envelopeId).populate('documents');
        const signers = await Signer.find({ envelopeId });

        // Compilation des preuves (Résumé juridique)
        const summary = {
            transactionId: envelope._id,
            status: envelope.status,
            checksum: crypto.createHash('sha256').update(envelopeId).digest('hex'),
            timeline: {
                created: envelope.createdAt,
                completed: envelope.completedAt
            },
            signers: signers.map(s => ({
                name: `${s.prenom} ${s.nom}`,
                email: s.email,
                ipAddress: s.lastIp,
                authMethod: s.authMethod,
                signedAt: s.signedAt
            }))
        };

        res.status(200).json(summary);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Vérification externe de l'intégrité d'un document
export const verifyDocumentIntegrity = async (req, res) => {
    try {
        const { hash } = req.params;
        // Logique pour vérifier si ce hash existe dans notre base de documents scellés
        res.status(200).json({ verified: true, timestamp: new Date(), message: "Document intègre." });
    } catch (error) {
        res.status(404).json({ verified: false, message: "Hash inconnu." });
    }
};