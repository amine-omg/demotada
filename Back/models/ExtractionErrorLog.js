import mongoose from 'mongoose';

const ExtractionErrorLogSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessingJob' },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  errorCode: { type: String, required: true }, // ex: "FONT_EXTRACTION_FAILED", "OCR_LOW_CONFIDENCE"
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  message: { type: String }, // Message d'erreur brut du moteur (Tesseract, PDF-lib...)
  context: {
    pageNumber: Number,
    coordinates: { x: Number, y: Number },
    inputData: mongoose.Schema.Types.Mixed // Données qui ont causé l'erreur
  },
  isResolved: { type: Boolean, default: false } // Pour ton dashboard admin interne
}, { timestamps: true });

const ExtractionErrorLog = mongoose.model('ExtractionErrorLog', ExtractionErrorLogSchema);
export default ExtractionErrorLog;