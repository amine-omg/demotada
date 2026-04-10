import mongoose from 'mongoose';

const typographySchema = new mongoose.Schema({
  // LIAISON STRUCTURELLE
  // À quel champ et à quel template ce profil s'applique-t-il ?
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blueprint',
    required: true,
    index: true
  },
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MappedField',
    required: true
  },

  // 1. COLOR MATCHING (Précision Chromatique)
  colorSettings: {
    hexValue: {
      type: String,
      required: true,
      default: '#000000',
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ // Validation stricte du format HEX
    },
    colorSpace: {
      type: String,
      enum: ['RGB', 'CMYK', 'GRAYSCALE'],
      default: 'RGB'
    },
    opacity: {
      type: Number,
      min: 0,
      max: 1,
      default: 1 // 1 = 100% opaque, 0.85 = fusion réaliste avec un scan
    }
  },

  // 2. HYPHENATION (Contrôle des Césures pour OpenXML/PDF)
  hyphenationSettings: {
    isEnabled: {
      type: Boolean,
      default: false // Désactivé par défaut pour éviter de couper des SIRET ou des noms propres
    },
    locale: {
      type: String,
      default: 'fr-FR' // Dictionnaire de césure
    },
    hyphenationZone: {
      type: Number, // Mesuré en twips (1/20e de point) pour l'intégration Word
      default: 360  // ~0.63 cm
    },
    maxConsecutiveHyphens: {
      type: Number,
      default: 2 // Évite les blocs de texte en escalier illisibles
    }
  },

  // 3. MICRO-GÉOMÉTRIE (Ajustement spatial sans changer la police)
  spacingSettings: {
    letterSpacing: {
      type: Number, // Mesuré en points (pt), ex: -0.15 pour resserrer
      default: 0
    },
    lineHeight: {
      type: Number, // Multiplicateur (ex: 1.15)
      default: 1
    },
    // Mode de contrainte de la boîte
    fitMode: {
      type: String,
      enum: ['overflow', 'shrink-to-fit', 'multiline'],
      default: 'shrink-to-fit' // Le texte se compresse horizontalement avant de casser la ligne
    }
  }
}, {
  timestamps: true // Garde une trace des modifications (utile pour le versioning via diffRoutes)
});

// Index composé pour s'assurer qu'un champ n'a qu'un seul profil typographique par template
typographySchema.index({ templateId: 1, fieldId: 1 }, { unique: true });

const TypographyProfile = mongoose.model('TypographyProfile', typographySchema);
export default TypographyProfile;