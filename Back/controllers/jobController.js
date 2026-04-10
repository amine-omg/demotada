// backend/controllers/jobController.js
import ProcessingJob from '../models/ProcessingJob.js';

// @desc    Récupérer le statut d'un job d'analyse
// @route   GET /api/jobs/:id
export const getJobStatus = async (req, res) => {
    try {
        const job = await ProcessingJob.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ message: "Job introuvable" });
        }

        res.json({
            status: job.status,        // 'pending', 'processing', 'completed', 'failed'
            progress: job.progress,    // 0 à 100
            currentStep: job.currentStep, // 'ocr', 'layout', 'mapping'...
            error: job.error
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Annuler un job (si l'utilisateur ferme la page par exemple)
// @route   DELETE /api/jobs/:id
export const cancelJob = async (req, res) => {
    try {
        await ProcessingJob.findByIdAndUpdate(req.params.id, { status: 'failed', error: 'Cancelled by user' });
        res.json({ message: "Job annulé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};