import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['contract', 'invoice', 'certificate', 'form', 'other'], 
    default: 'contract' 
  },
  backgroundUrl: { type: String, required: true }, // URL du PDF sur Cloudflare R2
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  // AJOUT : La logique de progression pour tes boutons
  progress: {
    upload: { type: String, enum: ['none', 'pending', 'complete', 'error'], default: 'none' },
    layout: { type: String, enum: ['none', 'pending', 'complete', 'error'], default: 'none' },
    vectors: { type: String, enum: ['none', 'pending', 'complete', 'error'], default: 'none' },
    logic: { type: String, enum: ['none', 'pending', 'complete', 'error'], default: 'none' },
    ocr: { type: String, enum: ['none', 'pending', 'complete', 'error'], default: 'none' }, // 👈 INDISPENSABLE
  },

  metadata: {
    pageCount: { type: Number, default: 1 },
    originalFileName: String,
    detectedFonts: [String], 
  },
  
  isDynamic: { type: Boolean, default: false }, 
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' }
}, { timestamps: true });

const Template = mongoose.model('Template', templateSchema);
export default Template;