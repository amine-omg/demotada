import ExportConfiguration from '../models/ExportConfiguration.js';
import GeneratedArtifact from '../models/GeneratedArtifact.js';
import ProcessingJob from '../models/ProcessingJob.js';

// @desc    Définir les paramètres d'export pour un template
// @route   POST /api/exports/config
export const saveExportConfig = async (req, res) => {
    try {
        const config = await ExportConfiguration.findOneAndUpdate(
            { templateId: req.body.templateId },
            { $set: req.body },
            { upsert: true, new: true }
        );
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lancer la génération d'un Word (Crée un Job et un Artefact vide)
// @route   POST /api/exports/generate
export const startGeneration = async (req, res) => {
    try {
        const { templateId, organizationId } = req.body;

        // 1. Créer un Job pour le suivi temps réel
        const job = await ProcessingJob.create({
            templateId,
            status: 'pending',
            currentStep: 'export_init'
        });

        // 2. Créer l'entrée Artefact (sera mise à jour quand le fichier sera prêt sur S3)
        const artifact = await GeneratedArtifact.create({
            jobId: job._id,
            creditsConsumed: 5, // Prix fixe ou calculé selon le document
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire dans 7 jours
        });

        res.status(202).json({ 
            message: "Génération lancée", 
            jobId: job._id, 
            artifactId: artifact._id 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer l'artefact une fois prêt
// @route   GET /api/exports/artifact/:id
export const getArtifact = async (req, res) => {
    try {
        const artifact = await GeneratedArtifact.findById(req.params.id).populate('jobId');
        if (!artifact) return res.status(404).json({ message: "Fichier introuvable" });
        
        res.json(artifact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};