// backend/models/TextFlowGroup.js
import mongoose from 'mongoose';

const textFlowGroupSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  pageNumber: { type: Number, required: true },
  
  // Liste des IDs de l'OcrLayer ou des Fields qui composent ce paragraphe
  elementIds: [{ type: mongoose.Schema.Types.ObjectId }], 
  
  // Boîte englobante du paragraphe complet
  boundingBox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  
  lineSpacing: { type: Number, default: 1.15 },
  alignment: { type: String, enum: ['left', 'center', 'right', 'justify'], default: 'left' }
}, { timestamps: true });

export default mongoose.model('TextFlowGroup', textFlowGroupSchema);