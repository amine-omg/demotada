import ActivityLog from '../models/ActivityLog.js';
import Envelope from '../models/Envelope.js';

// Récupérer le journal technique pour le dossier de preuve
export const getSignatureAudit = async (req, res) => {
    try {
        const { envelopeId } = req.params;

        // On récupère tous les logs liés à l'enveloppe (ouverts, signés, OTP envoyés)
        const logs = await ActivityLog.find({ 
            'metadata.envelopeId': envelopeId 
        }).sort({ timestamp: 1 });

        if (!logs) {
            return res.status(404).json({ message: "Aucun log trouvé pour cette enveloppe." });
        }

        res.status(200).json({
            envelopeId,
            generatedAt: new Date(),
            events: logs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};