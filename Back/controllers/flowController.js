import Flow from '../models/Flow.js';

// Créer un bloc de texte (Flow) à partir de plusieurs lignes
export const createFlowBlock = async (req, res) => {
    try {
        const { documentId, region, textContent, style } = req.body;

        const flow = new Flow({
            documentId,
            region, // Coordonnées du bloc sur la page
            textContent,
            style, // Infos de police, taille, etc.
            lastUpdated: Date.now()
        });

        await flow.save();
        res.status(201).json(flow);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer tous les paragraphes d'un document pour l'éditeur
export const getDocumentFlows = async (req, res) => {
    try {
        const { documentId } = req.params;
        const flows = await Flow.find({ documentId }).sort({ 'region.y': 1 });
        res.status(200).json(flows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};