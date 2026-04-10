import mongoose from 'mongoose';

const layeringSchema = new mongoose.Schema({
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

  // 1. POSITION DANS LA PILE (Z-INDEX)
  stackingOrder: {
    type: Number,
    default: 10, // On utilise des paliers (ex: 10, 20, 30) pour insérer facilement entre les couches
    required: true
  },

  // 2. PROPRIÉTÉS DE COUCHE
  layerProperties: {
    opacity: { 
      type: Number, 
      default: 1, 
      min: 0, 
      max: 1 
    },
    // Mode de fusion PDF (Normal, Multiply, Screen)
    // 'Multiply' est génial pour les signatures : ça simule l'encre qui se mélange au papier
    blendMode: {
      type: String,
      enum: ['Normal', 'Multiply', 'Screen', 'Overlay'],
      default: 'Normal'
    },
    // Est-ce que cet élément doit être imprimable ou uniquement visible à l'écran ?
    isPrintable: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false } // Verrouillage dans le studio Vue.js
  }

}, { timestamps: true });

// Un seul réglage de couche par champ et par template
layeringSchema.index({ templateId: 1, fieldId: 1 }, { unique: true });

const Layering = mongoose.model('Layering', layeringSchema);
export default Layering;