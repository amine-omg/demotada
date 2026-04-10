import ApiKey from '../models/ApiKey.js';
import crypto from 'crypto';

// Générer une nouvelle clé API
export const generateApiKey = async (req, res) => {
    try {
        const { tenantId, name, permissions } = req.body;

        // Génération d'une clé aléatoire
        const rawKey = `kn_${crypto.randomBytes(24).toString('hex')}`;
        
        // On stocke le hash pour la vérification (sécurité type GitHub/Stripe)
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedKey = crypto.scryptSync(rawKey, salt, 64).toString('hex');

        const newKey = new ApiKey({
            tenantId,
            name,
            keyHash: hashedKey,
            keySalt: salt,
            lastChars: rawKey.slice(-4), // Pour affichage dans l'UI (ex: ****abcd)
            permissions: permissions || ['read:documents'],
            createdAt: Date.now()
        });

        await newKey.save();

        // On ne renvoie la clé brute QU'UNE SEULE FOIS à la création
        res.status(201).json({
            message: "Clé API générée. Notez-la bien, elle ne sera plus affichée.",
            apiKey: rawKey,
            details: newKey
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer les clés actives pour un Tenant
export const getApiKeysByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const keys = await ApiKey.find({ tenantId, isActive: true }).select('-keyHash -keySalt');
        res.status(200).json(keys);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Révoquer une clé
export const revokeApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        await ApiKey.findByIdAndUpdate(id, { isActive: false, revokedAt: Date.now() });
        res.status(200).json({ message: "Clé API révoquée avec succès." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};