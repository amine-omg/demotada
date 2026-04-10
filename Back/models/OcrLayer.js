import mongoose from 'mongoose';

const OcrLayerSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  pageNumber: { type: Number, required: true },
  fullText: { type: String }, // Texte brut complet de la page
  blocks: [{
    text: String,
    confidence: Number, // Score de 0 à 1 (ex: 0.98 pour une lecture sûre)
    bbox: {
      x0: Number, y0: Number, x1: Number, y1: Number // Boîte englobante
    },
    language: { type: String, default: 'fr' }
  }],
  engineUsed: { type: String, default: 'Tesseract/AWS_Textract' },
  isHandwritten: { type: Boolean, default: false } // Détection d'écriture manuscrite
}, { timestamps: true });


const OcrLayer = mongoose.model('OcrLayer', OcrLayerSchema);

export default OcrLayer;