import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey' },
  
  action: { 
    type: String, 
    enum: ['pdf_scan', 'pdf_generation', 'e_signature', 'ai_mapping'], 
    required: true 
  },
  
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  
  // Métadonnées pour le pricing (ex: nombre de pages, poids du fichier)
  metadata: {
    pages: { type: Number, default: 1 },
    fileSize: Number
  },

  // On stocke le coût à l'instant T (si tu changes tes tarifs plus tard)
  costAtExecution: { type: Number, default: 0 } 

}, { timestamps: true });

// Indexation massive pour sortir les factures clients en 1 seconde
usageLogSchema.index({ organizationId: 1, createdAt: -1 });

const UsageLog = mongoose.model('UsageLog', usageLogSchema);
export default UsageLog;