import Folder from '../models/Folder.js';

// Créer un nouveau dossier (ex: "Promotions 2026")
export const createFolder = async (req, res) => {
    try {
        const { tenantId, name, parentFolderId, description } = req.body;

        const folder = new Folder({
            tenantId,
            name,
            parentFolderId: parentFolderId || null, // Support pour les sous-dossiers
            description,
            createdBy: req.user._id
        });

        await folder.save();
        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lister les dossiers d'un client
export const getFoldersByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const folders = await Folder.find({ tenantId }).sort({ name: 1 });
        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Renommer ou déplacer un dossier
export const updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const folder = await Folder.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json(folder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};