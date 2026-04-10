// backend/models/SemanticPattern.js
import mongoose from 'mongoose';

const semanticPatternSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ex: "French_VAT_Calculation"
  documentType: String, // ex: "Invoice", "BPF"
  
  // Les ancres de reconnaissance
  keywords: [String], // ["Total HT", "TVA", "Montant TTC"]
  
  // La logique mathématique à vérifier
  rules: [{
    targetField: String, // "total_ttc"
    formula: String,     // "total_ht + total_tva"
    tolerance: { type: Number, default: 0.01 } // Pour gérer les arrondis
  }],

  confidenceWeight: { type: Number, default: 1 } // Importance du pattern dans l'analyse
}, { timestamps: true });

export default mongoose.model('SemanticPattern', semanticPatternSchema);