import mongoose from 'mongoose';

const ProcessingJobSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  progress: { type: Number, default: 0 }, // Pourcentage 0-100
  currentStep: { 
    type: String, 
    enum: ['uploading', 'ocr_analysis', 'font_extraction', 'semantic_mapping', 'finalizing'] 
  },
  priority: { type: Number, default: 1 }, // Pour prioriser les gros clients ou les petits fichiers
  startedAt: { type: Date },
  completedAt: { type: Date },
  errorReference: { type: mongoose.Schema.Types.ObjectId, ref: 'ExtractionErrorLog' }
}, { timestamps: true });



const ProcessingJob = mongoose.model('ProcessingJob', ProcessingJobSchema);

export default ProcessingJob;