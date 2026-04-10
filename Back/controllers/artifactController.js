import GeneratedArtifact from '../models/GeneratedArtifact.js';
import ProcessingJob from '../models/ProcessingJob.js';

// @desc    Mettre à jour l'artefact quand le fichier est prêt (appelé par le worker de génération)
// @route   PATCH /api/artifacts/:id/complete
export const completeArtifact = async (req, res) => {
    try {
        const { fileUrl, fileSize } = req.body;

        const artifact = await GeneratedArtifact.findByIdAndUpdate(
            req.params.id,
            { 
                fileUrl, 
                status: 'ready' 
            },
            { new: true }
        );

        // On met aussi à jour le Job lié
        await ProcessingJob.findByIdAndUpdate(artifact.jobId, {
            status: 'completed',
            progress: 100,
            currentStep: 'finished'
        });

        res.json({ message: "Fichier prêt au téléchargement", artifact });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer les métadonnées pour le téléchargement
// @route   GET /api/artifacts/:id
export const getArtifactDetails = async (req, res) => {
    try {
        const artifact = await GeneratedArtifact.findById(req.params.id);
        
        if (!artifact) {
            return res.status(404).json({ message: "Artefact introuvable." });
        }

        // Vérifier si le lien a expiré
        if (new Date() > artifact.expiresAt) {
            return res.status(410).json({ message: "Le lien de téléchargement a expiré." });
        }

        res.json(artifact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};