import Envelope from '../models/Envelope.js';

// Créer une enveloppe de signature
export const createEnvelope = async (req, res) => {
    try {
        const { tenantId, title, documents, expirationDate, workflowType } = req.body;

        const envelope = new Envelope({
            tenantId,
            ownerId: req.user._id,
            title,
            documents, // Array d'IDs de documents
            status: 'draft',
            workflowType: workflowType || 'sequential',
            expirationDate: expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        await envelope.save();
        res.status(201).json(envelope);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Envoyer l'enveloppe (déclenche les emails aux signataires)
export const sendEnvelope = async (req, res) => {
    try {
        const { id } = req.params;
        const envelope = await Envelope.findByIdAndUpdate(
            id,
            { status: 'sent', sentAt: Date.now() },
            { new: true }
        );
        
        // Logique pour notifier le premier signataire ici...
        
        res.status(200).json({ message: "Enveloppe envoyée aux signataires.", envelope });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer le statut global pour le dashboard
export const getEnvelopeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const envelope = await Envelope.findById(id).populate('documents');
        res.status(200).json(envelope);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};