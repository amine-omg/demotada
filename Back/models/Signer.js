import mongoose from 'mongoose';

const signerSchema = new mongoose.Schema({
  envelopeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Envelope', required: true },
  
  // Infos de l'invité
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String }, // Pour l'OTP SMS
  
  role: { type: String, default: 'signer' }, // 'signer', 'viewer' (CC), 'approver'
  
  // Authentification de la signature
  authMethod: { type: String, enum: ['email', 'sms', 'none'], default: 'email' },
  accessCode: { type: String }, // Code secret optionnel pour ouvrir le doc
  
  status: { 
    type: String, 
    enum: ['waiting', 'sent', 'delivered', 'signed', 'declined'], 
    default: 'waiting' 
  },

  lastNotifiedAt: { type: Date },
  signedAt: { type: Date },
  declinedReason: { type: String }
}, { timestamps: true });

const Signer = mongoose.model('Signer', signerSchema);
export default Signer;