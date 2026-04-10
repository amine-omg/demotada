// backend/controllers/diffController.js
import VisualDiffLog from '../models/VisualDiffLog.js';
import ProcessingJob from '../models/ProcessingJob.js';

// @desc    Enregistrer un rapport de comparaison visuelle (PDF vs Word-Generated)
// @route   POST /api/diffs
export const createDiffLog = async (req, res) => {
    try {
        const { jobId, templateId, similarityScore, discrepancies, diffImageUrl } = req.body;

        const log = await VisualDiffLog.create({
            jobId,
            templateId,
            similarityScore,
            discrepancies,
            diffImageUrl
        });

        // Optionnel : Mettre à jour le statut du Job si le score est trop bas
        if (similarityScore < 0.80) {
            await ProcessingJob.findByIdAndUpdate(jobId, { 
                status: 'failed', 
                error: 'Visual similarity threshold not met' 
            });
        }

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer l'historique des comparaisons pour un template
// @route   GET /api/diffs/template/:templateId
export const getDiffsByTemplate = async (req, res) => {
    try {
        const logs = await VisualDiffLog.find({ templateId: req.params.templateId })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer un rapport précis (pour afficher l'image de diff)
// @route   GET /api/diffs/:id
export const getDiffById = async (req, res) => {
    try {
        const log = await VisualDiffLog.findById(req.params.id);
        if (!log) return res.status(404).json({ message: "Rapport introuvable" });
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};