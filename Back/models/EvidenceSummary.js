const mongoose = require('mongoose');

const EvidenceSummarySchema = new mongoose.Schema({
  envelopeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Envelope', unique: true },
  completionDate: { type: Date },
  documentHashes: [{
    fileName: String,
    sha256: String, // Empreinte unique du fichier PDF final
    size: Number
  }],
  auditTrail: [{
    timestamp: Date,
    action: String, // ex: "Document Viewed", "Sms Verified", "Signed"
    signerName: String,
    ipAddress: String,
    fingerprint: String // Device fingerprinting
  }],
  certificateSerial: { type: String }, // Lien vers l'autorité de certification
  status: { type: String, default: 'Generated' }
}, { timestamps: true });

const EvidenceSummary = mongoose.model('EvidenceSummary', EvidenceSummarySchema);
export default EvidenceSummary;