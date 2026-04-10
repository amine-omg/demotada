import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }, // Optionnel : certificat propre au client ou global Kernain
  
  provider: { type: String, required: true }, // ex: "Universign", "Yousign", "Internal-HSM"
  serialNumber: { type: String, required: true, unique: true },
  
  // Dates de validité du certificat
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  
  // Public Key Info (pour la vérification sans le secret)
  publicKeyFingerprint: String,
  
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  
  // Stockage du certificat (souvent un lien vers un Key Vault sécurisé)
  vaultReference: String, 
  
  usageCount: { type: Number, default: 0 } // Combien de fois ce certificat a scellé un doc
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;