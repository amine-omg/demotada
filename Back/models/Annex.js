// backend/models/Annex.js
import mongoose from 'mongoose';

const annexSchema = new mongoose.Schema({
  parentDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  title: { type: String, default: "Annexe complémentaire" },
  
  // Référence au champ qui a débordé
  sourceFieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  
  // Contenu qui n'a pas pu rentrer dans la case
  overflowContent: String,
  
  // Template de mise en page pour l'annexe (souvent très simple/pro)
  layoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Layout' }
}, { timestamps: true });

export default mongoose.model('Annex', annexSchema);