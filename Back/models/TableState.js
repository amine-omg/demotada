// backend/models/TableState.js
import mongoose from 'mongoose';

const tableStateSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'TableStructure', required: true },
  
  // L'état dynamique
  addedRowsCount: { type: Number, default: 0 },
  totalVerticalShift: { type: Number, default: 0 }, // En pixels/points
  
  // Configuration de l'élasticité
  isElastic: { type: Boolean, default: false } // False pour les CERFA, True pour les factures
}, { timestamps: true });

export default mongoose.model('TableState', tableStateSchema);