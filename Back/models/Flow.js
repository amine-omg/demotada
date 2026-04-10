// backend/models/Flow.js
import mongoose from 'mongoose';

const flowSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  // La région rectangulaire du bloc sur la page
  region: {
    page: { type: Number, default: 1 },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number }
  },
  // Le contenu textuel consolidé
  textContent: { 
    type: String, 
    required: true 
  },
  // Propriétés de style pour la reconstruction Word/PDF
  style: {
    fontSize: { type: Number, default: 10 },
    fontFamily: { type: String, default: 'Arial' },
    fontWeight: { type: String, default: 'normal' },
    textAlign: { type: String, enum: ['left', 'center', 'right', 'justify'], default: 'left' },
    color: { type: String, default: '#000000' }
  },
  // Ordre de lecture (pour savoir quel paragraphe vient avant l'autre)
  order: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexation pour récupérer rapidement les blocs d'un doc par ordre de lecture
flowSchema.index({ documentId: 1, order: 1 });

const Flow = mongoose.model('Flow', flowSchema);
export default Flow;