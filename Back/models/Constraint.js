// backend/models/Constraint.js
import mongoose from 'mongoose';

const constraintSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  
  // Règles de mise en page
  padding: {
    top: { type: Number, default: 2 },
    bottom: { type: Number, default: 2 },
    left: { type: Number, default: 5 },
    right: { type: Number, default: 5 }
  },

  // Comportement dynamique
  behavior: {
    overflow: { type: String, enum: ['shrink', 'wrap', 'truncate'], default: 'shrink' },
    minFontSize: { type: Number, default: 6 }, // On ne descend pas en dessous de 6pt pour rester lisible
    alignment: { type: String, enum: ['left', 'center', 'right', 'justify'], default: 'left' },
    verticalAlignment: { type: String, enum: ['top', 'middle', 'bottom'], default: 'middle' }
  },

  // Logique métier (ex: "Si montant > 10000, mettre en rouge")
  conditionalFormatting: [{
    condition: String, // Mini-script ou regex
    style: Object
  }]
}, { timestamps: true });

export default mongoose.model('Constraint', constraintSchema);