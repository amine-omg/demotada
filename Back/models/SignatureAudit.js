import mongoose from 'mongoose';

const signatureAuditSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  signerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Preuves techniques
  ipAddress: String,
  userAgent: String,
  documentHash: { type: String, required: true }, // Empreinte numérique du PDF au moment de la signature
  
  // Horodatage certifié
  timestampToken: String, // Jeton d'horodatage d'une autorité de certification
  
  // Vérification OTP (SMS/Email)
  verificationMethod: { type: String, enum: ['email', 'sms'], default: 'email' },
  verificationPhone: String,
  
  signedAt: { type: Date, default: Date.now },
  certificateSerial: String // Numéro du certificat utilisé pour sceller le doc
}, { timestamps: true });

const SignatureAudit = mongoose.model('SignatureAudit', signatureAuditSchema);
export default SignatureAudit;