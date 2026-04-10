import ActivityLog from '../models/ActivityLog.js';

// Récupérer l'historique d'un document spécifique (Audit Trail)
export const getDocumentHistory = async (req, res) => {
    try {
        const { documentId } = req.params;
        const logs = await ActivityLog.find({ documentId })
            .populate('userId', 'nom prenom role')
            .sort({ timestamp: -1 });

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer tous les logs d'un Tenant (Vue Admin globale)
export const getTenantActivity = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const logs = await ActivityLog.find({ tenantId })
            .populate('userId', 'nom prenom')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fonction interne (Utilitaire) pour logger une action
// À importer dans tes autres controllers (ex: documentController)
export const createInternalLog = async (data) => {
    try {
        const log = new ActivityLog({
            tenantId: data.tenantId,
            userId: data.userId,
            documentId: data.documentId,
            action: data.action, // ex: 'SIGNATURE_COMPLETED', 'DOCUMENT_OPENED'
            ipAddress: data.ip,
            userAgent: data.userAgent,
            metadata: data.metadata
        });
        await log.save();
    } catch (err) {
        console.error("Erreur de logging critique:", err);
    }
};