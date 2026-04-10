// backend/models/TemplateSelfCorrection.js
import mongoose from 'mongoose';

const selfCorrectionSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  
  // Ajustements appris au fil des comparaisons
  learnedOffsets: [{
    elementId: mongoose.Schema.Types.ObjectId, // Référence au Field ou FlowGroup
    adjustX: { type: Number, default: 0 },
    adjustY: { type: Number, default: 0 },
    scaleAdjustment: { type: Number, default: 1.0 }
  }],

  iterationCount: { type: Number, default: 0 } // Nombre de fois que ce template a été auto-corrigé
}, { timestamps: true });

export default mongoose.model('TemplateSelfCorrection', selfCorrectionSchema);