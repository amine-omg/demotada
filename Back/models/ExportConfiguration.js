// backend/models/ExportConfiguration.js
import mongoose from 'mongoose';

const exportConfigSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  targetFormat: { type: String, enum: ['docx', 'google_doc', 'pptx'], default: 'docx' },
  reconstructionMethod: { type: String, enum: ['flow', 'absolute'], default: 'absolute' },
  options: {
    includeImages: { type: Boolean, default: true },
    ocrCorrection: { type: Boolean, default: true },
    flattenVectors: { type: Boolean, default: false }
  }
});

export default mongoose.model('ExportConfiguration', exportConfigSchema);