const mongoose = require('mongoose');

const DeclinedRecordSchema = new mongoose.Schema({
  envelopeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Envelope', required: true },
  signerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signer', required: true },
  reason: { type: String, required: true }, // Le texte saisi par l'utilisateur
  declinedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }, // Navigateur, OS, etc.
  metadata: {
    location: {
      city: String,
      country: String
    }
  }
}, { timestamps: true });

const DeclinedRecord = mongoose.model('DeclinedRecord', DeclinedRecordSchema);
export default DeclinedRecord;