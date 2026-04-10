import mongoose from 'mongoose';

const envelopeSchema = new mongoose.Schema({
  title: { type: String, required: true }, // ex: "Dossier d'inscription - Jean Dupont"
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Une enveloppe peut contenir plusieurs documents (Contrat + Règlement + Annexe)
  documents: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    order: { type: Number, default: 0 }
  }],

  status: { 
    type: String, 
    enum: ['draft', 'sent', 'delivered', 'completed', 'declined', 'voided'], 
    default: 'draft' 
  },

  // Options de l'enveloppe
  settings: {
    expirationDays: { type: Number, default: 30 },
    reminderEnabled: { type: Boolean, default: true },
    signingOrderEnabled: { type: Boolean, default: true } // Si true, respecte le SignatureFlow
  },

  completedAt: { type: Date },
  voidedReason: { type: String }
}, { timestamps: true });

const Envelope = mongoose.model('Envelope', envelopeSchema);
export default Envelope;