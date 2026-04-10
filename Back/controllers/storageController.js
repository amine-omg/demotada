import StorageProvider from '../models/StorageProvider.js';
// Note : Tu devras installer les SDK spécifiques (google-cloud/storage, aws-sdk, etc.)
// pour implémenter la logique d'envoi réelle dans ton moteur de rendu.

export const upsertStorageProvider = async (req, res) => {
    try {
        const { 
            tenantId, 
            providerType, // 's3', 'google-drive', 'dropbox', 'ftp'
            config,       // Clés API, Buckets, Dossiers cibles (chiffrés en DB)
            autoExport    // Boolean : export automatique dès génération ?
        } = req.body;

        const provider = await StorageProvider.findOneAndUpdate(
            { tenantId, providerType },
            { 
                config, 
                autoExport,
                updatedAt: Date.now() 
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            message: `Configuration ${providerType} sauvegardée.`,
            provider: { id: provider._id, type: provider.providerType, autoExport: provider.autoExport }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getStorageConfigs = async (req, res) => {
    try {
        const { tenantId } = req.params;
        // On ne renvoie pas les secrets/clés API pour des raisons de sécurité
        const configs = await StorageProvider.find({ tenantId }).select('-config.secretKey -config.apiKey');
        res.status(200).json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteStorageConfig = async (req, res) => {
    try {
        const { id } = req.params;
        await StorageProvider.findByIdAndDelete(id);
        res.status(200).json({ message: "Configuration de stockage supprimée." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};