import mongoose from 'mongoose';

const inkStyleSchema = new mongoose.Schema({
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

  // 1. SIMULATION PHYSIQUE DE L'ENCRE
  renderingSettings: {
    inkColor: {
      type: String,
      default: '#000080' // Bleu marine "Stylo" par défaut
    },
    pressureSensitivity: {
      type: Number, // Simule la variation d'épaisseur (0.1 à 1.5)
      default: 1.0
    },
    inkBleed: {
      type: Number, // Simule la diffusion de l'encre dans les fibres (en pixels)
      default: 0.2,
      min: 0,
      max: 2
    },
    textureType: {
      type: String,
      enum: ['ballpoint', 'gel', 'fountain', 'felt-tip'],
      default: 'ballpoint'
    }
  },

  // 2. RENDU VISUEL SUR LE SCAN
  visualIntegration: {
    opacity: {
      type: Number,
      default: 0.95, // Une encre n'est jamais 100% opaque sur un scan
      min: 0,
      max: 1
    },
    antiAliasing: {
      type: Boolean,
      default: true
    },
    // Simule le "grain" du papier sous l'encre
    paperTextureInfluence: {
      type: Number, 
      default: 0.1, // 0 à 1
    }
  }
}, {
  timestamps: true
});

inkStyleSchema.index({ templateId: 1, fieldId: 1 }, { unique: true });

const InkStyle = mongoose.model('InkStyle', inkStyleSchema);
export default InkStyle;