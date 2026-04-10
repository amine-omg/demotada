const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blueprint',
    required: true
  },
  documentId: { 
    type: String, 
    required: true, 
    unique: true // Identifiant unique du doc généré (ex: KRN-2026-X)
  },

  // 1. SCELLAGE NUMÉRIQUE (Hash)
  integrity: {
    fingerprint: { type: String, required: true }, // Hash SHA-256 du PDF final
    algorithm: { type: String, default: 'SHA-256' },
    sealedAt: { type: Date, default: Date.now }
  },

  // 2. LOG D'AUDIT (Traçabilité)
  auditLog: [{
    action: { type: String }, // ex: "GENERATED", "SIGNED_BY_STAGIAIRE", "VALIDATED"
    timestamp: { type: Date, default: Date.now },
    actor: { type: String },    // ID de l'user ou système (HubSpot/Syali)
    ipAddress: { type: String }
  }],

  // 3. CERTIFICAT D'AUTHENTICITÉ
  certificateConfig: {
    includeQR: { type: Boolean, default: true }, // QR Code de vérification
    certificatePage: { type: Boolean, default: true }, // Page dédiée à la fin du doc
    isLegallyBinding: { type: Boolean, default: true }
  }

}, { timestamps: true });

const Certification = mongoose.model('Certification', certificationSchema);
export default Certification;