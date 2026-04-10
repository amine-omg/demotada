import UsageLog from '../models/UsageLog.js';

// Enregistrer une consommation (à appeler dans tes moteurs de génération)
export const logUsage = async (req, res) => {
    try {
        const { tenantId, actionType, count, metadata } = req.body;

        const log = new UsageLog({
            tenantId,
            userId: req.user._id,
            actionType, // 'pdf_generation', 'e_signature', 'ai_extraction'
            count: count || 1,
            metadata // Infos sup: ID du document, taille du fichier, etc.
        });

        await log.save();
        res.status(201).json({ message: "Consommation enregistrée.", log });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer la consommation totale d'un mois pour un client
export const getTenantUsageStats = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { month, year } = req.query; // ex: ?month=3&year=2026

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const stats = await UsageLog.aggregate([
            { $match: { 
                tenantId: mongoose.Types.ObjectId(tenantId),
                timestamp: { $gte: startDate, $lte: endDate }
            }},
            { $group: { 
                _id: "$actionType", 
                total: { $sum: "$count" } 
            }}
        ]);

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};