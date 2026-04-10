import mongoose from 'mongoose';

const PageLayoutSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  pageNumber: { type: Number, required: true },
  dimensions: {
    width: { type: Number, required: true }, // Souvent en points (1pt = 1/72 inch)
    height: { type: Number, required: true },
    unit: { type: String, default: 'pt' } // pt, mm, px
  },
  margins: {
    top: Number,
    bottom: Number,
    left: Number,
    right: Number
  },
  orientation: { 
    type: String, 
    enum: ['portrait', 'landscape'], 
    default: 'portrait' 
  },
  dpi: { type: Number, default: 72 }, // Résolution de l'analyse originale
  backgroundLayerId: { type: String } // Référence interne vers l'image de fond compressée (preview)
}, { timestamps: true });


const PageLayout = mongoose.model('PageLayout', PageLayoutSchema);

export default PageLayout;