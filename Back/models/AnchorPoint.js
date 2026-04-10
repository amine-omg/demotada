import mongoose from 'mongoose';

const anchorPointSchema = new mongoose.Schema({
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

  // 1. GÉOMÉTRIE DE ROTATION
  rotationSettings: {
    angle: {
      type: Number,
      default: 0, // En degrés (ex: 1.5 ou -0.5)
      min: -360,
      max: 360
    },
    origin: {
      type: String,
      enum: ['top-left', 'center', 'bottom-left', 'baseline-left'],
      default: 'baseline-left' // Crucial pour que le texte "pose" sur la ligne
    }
  },

  // 2. ALIGNEMENT DE PRÉCISION (BASELINE)
  alignmentSettings: {
    horizontal: {
      type: String,
      enum: ['left', 'center', 'right', 'justify'],
      default: 'left'
    },
    vertical: {
      type: String,
      enum: ['top', 'center', 'bottom', 'baseline'],
      default: 'baseline'
    },
    // Micro-ajustement vertical (en points) pour coller à la ligne du scan
    baselineOffset: {
      type: Number,
      default: 0
    }
  },

  // 3. COMPORTEMENT D'ANCRAGE DYNAMIQUE
  anchorStrategy: {
    type: String,
    enum: ['absolute', 'relative-to-keyword', 'relative-to-container'],
    default: 'absolute'
  }
}, {
  timestamps: true
});

anchorPointSchema.index({ templateId: 1, fieldId: 1 }, { unique: true });


const AnchorPoint = mongoose.model('AnchorPoint', anchorPointSchema);
export default AnchorPoint;