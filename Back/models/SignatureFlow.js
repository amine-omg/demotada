import mongoose from 'mongoose';

const signatureFlowSchema = new mongoose.Schema({
  envelopeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Envelope', required: true },
  
  // Mapping de l'ordre
  steps: [{
    signerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signer' },
    order: { type: Number, required: true }, // ex: 1 pour les premiers, 2 pour les suivants
    status: { type: String, enum: ['pending', 'current', 'completed'], default: 'pending' }
  }],

  currentStep: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const SignatureFlow = mongoose.model('SignatureFlow', signatureFlowSchema);
export default SignatureFlow;