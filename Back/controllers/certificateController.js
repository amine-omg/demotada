// backend/controllers/certificateController.js
import Certificate from '../models/Certificate.js';

// Récupérer tous les certificats d'un utilisateur (La fonction qui manquait !)
export const getUserCertificates = async (req, res) => {
    try {
        const { userId } = req.params;
        const certificates = await Certificate.find({ userId });
        
        res.status(200).json(certificates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Enregistrer un nouveau certificat
export const registerCertificate = async (req, res) => {
    try {
        const { userId, serialNumber, issuer, validUntil } = req.body;

        const cert = new Certificate({
            userId,
            serialNumber,
            issuer,
            validUntil,
            status: 'active'
        });

        await cert.save();
        res.status(201).json(cert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};