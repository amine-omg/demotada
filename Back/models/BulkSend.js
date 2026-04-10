import mongoose from 'mongoose';

const BulkSendSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  name: { type: String, required: true }, // ex: "Campagne Contrats CDD Mars 2026"
  status: { 
    type: String, 
    enum: ['draft', 'processing', 'completed', 'failed'], 
    default: 'draft' 
  },
  stats: {
    totalRecipients: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 }
  },
  envelopesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Envelope' }],
  csvFileUrl: { type: String } // Archive du fichier source
}, { timestamps: true });

const BulkSend = mongoose.model('BulkSend', BulkSendSchema);
export default BulkSend;