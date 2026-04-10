import mongoose from 'mongoose';

const anchorStrategySchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true,
    unique: true // Une seule stratégie d'ancrage par champ
  },
  
  // Le texte exact que le moteur doit chercher dans l'OcrLayer
  anchorText: {
    type: String,
    required: true,
    trim: true
  },

  // La position relative par rapport au mot-clé trouvé
  relation: {
    type: String,
    enum: ['above', 'below', 'left', 'right', 'overlap'],
    default: 'below'
  },

  // Décalage précis en points (pt) par rapport à l'ancre
  offset: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 10 } // Par défaut, 10pt en dessous
  },

  // Si l'ancre n'est pas trouvée, doit-on utiliser les coordonnées fixes du Field ?
  fallbackToFixed: {
    type: Boolean,
    default: true
  },

  // Sensibilité à la casse ou recherche partielle
  settings: {
    caseSensitive: { type: Boolean, default: false },
    occurrence: { type: Number, default: 1 } // 1 = première fois qu'on voit le mot, 2 = deuxième, etc.
  }
}, {
  timestamps: true
});

// Index pour accélérer la recherche par champ
anchorStrategySchema.index({ fieldId: 1 });

const AnchorStrategy = mongoose.model('AnchorStrategy', anchorStrategySchema);

export default AnchorStrategy;