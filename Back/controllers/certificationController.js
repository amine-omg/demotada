// backend/controllers/certificationController.js
import Certification from '../models/Metadata.js'; // Importation du modèle existant
import crypto from 'crypto';

// Créer le certificat lors de la génération finale
export const sealDocument = async (req, res) => {
  try {
    const { templateId, documentId, rawContent, actorInfo } = req.body;

    // Calcul du Hash SHA-256 pour garantir l'intégrité
    const hash = crypto.createHash('sha256').update(rawContent).digest('hex');

    const cert = new Certification({
      templateId,
      documentId,
      integrity: { 
        fingerprint: hash,
        sealedAt: Date.now() 
      },
      auditLog: [{
        action: 'GENERATED_AND_SEALED',
        actor: actorInfo,
        ipAddress: req.ip,
        timestamp: Date.now()
      }]
    });

    await cert.save();
    res.status(201).json({ message: "Document scellé numériquement.", fingerprint: hash });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Vérifier l'intégrité d'un document existant
export const verifyIntegrity = async (req, res) => {
  try {
    const { documentId, currentHash } = req.body;
    const cert = await Certification.findOne({ documentId });

    if (!cert) {
        return res.status(404).json({ message: "Aucun certificat trouvé." });
    }

    const isValid = cert.integrity.fingerprint === currentHash;
    
    res.status(200).json({ 
      isValid, 
      originalFingerprint: cert.integrity.fingerprint,
      certifiedAt: cert.integrity.sealedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};