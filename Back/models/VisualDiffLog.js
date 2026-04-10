// backend/models/VisualDiffLog.js
import mongoose from 'mongoose';

const visualDiffLogSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessingJob' },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  
  // Score de similarité globale (0 à 1)
  similarityScore: Number, 
  
  // Liste des zones où l'écart est trop grand (> 5%)
  discrepancies: [{
    area: { x: Number, y: Number, w: Number, h: Number },
    type: { type: String, enum: ['position', 'font_size', 'color', 'missing_element'] },
    delta: mongoose.Schema.Types.Mixed // ex: { dy: -3 }
  }],
  
  diffImageUrl: String // Image générée montrant les zones rouges (erreurs)
}, { timestamps: true });

export default mongoose.model('VisualDiffLog', visualDiffLogSchema);