// backend/controllers/errorLogController.js
import ExtractionErrorLog from '../models/ExtractionErrorLog.js';

// @desc    Enregistrer une erreur d'extraction (appelé par le service de parsing)
// @route   POST /api/errors/logs
export const logExtractionError = async (req, res) => {
    try {
        const { templateId, jobId, errorCode, fieldId, message, rawData } = req.body;

        const errorLog = await ExtractionErrorLog.create({
            templateId,
            jobId,
            errorCode, // ex: 'LOW_CONFIDENCE', 'INVALID_FORMAT', 'MISSING_ANCHOR'
            fieldId,
            message,
            rawData,   // La valeur brute qui a posé problème pour analyse
            severity: req.body.severity || 'low'
        });

        res.status(201).json(errorLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer les erreurs d'un template spécifique
// @route   GET /api/errors/template/:templateId
export const getErrorsByTemplate = async (req, res) => {
    try {
        const logs = await ExtractionErrorLog.find({ templateId: req.params.templateId })
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};