import mongoose from 'mongoose';

const SemanticContextSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  documentType: { 
    type: String, 
    enum: ['invoice', 'contract', 'cerfa', 'id_card', 'payslip', 'test_positionnement', 'unknown'],
    default: 'unknown'
  },
  
  extractedData: { type: mongoose.Schema.Types.Mixed, default: {} }, 

  detectedLanguage: { type: String, default: 'fr' },
  confidenceScore: { type: Number },
  keywordsFound: [String],
  version: { type: String },
  suggestedAliasMaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AliasMap' }]
}, { timestamps: true });

const SemanticContext = mongoose.model('SemanticContext', SemanticContextSchema);
export default SemanticContext;