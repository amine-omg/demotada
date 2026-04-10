// backend/models/DocumentPatch.js
import mongoose from 'mongoose';

const documentPatchSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  pageNumber: { type: Number, required: true },
  
  // Type d'intervention : 'erase' (gommer), 'replace' (réécrire), 'overlay' (ajouter)
  type: { type: String, enum: ['erase', 'replace', 'overlay'], required: true },
  
  // Coordonnées chirurgicales
  rect: {
    x: Number, y: Number, width: Number, height: Number
  },
  
  // Le nouveau contenu
  content: String, 
  style: {
    fontId: { type: mongoose.Schema.Types.ObjectId, ref: 'FontAsset' },
    fontSize: Number,
    color: String
  },

  // Pour le "Undo/Redo" et l'audit
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('DocumentPatch', documentPatchSchema);