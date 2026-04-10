// backend/models/FontAsset.js
import mongoose from 'mongoose';

const fontAssetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true // ex: "Arial-Bold"
  },
  family: { type: String, required: true }, // ex: "Arial"
  weight: { type: String, default: 'normal' },
  style: { type: String, default: 'normal' },
  fileUrl: { type: String, required: true }, // URL Cloudinary ou S3
  isSystemFont: { type: Boolean, default: false },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    sparse: true // Permet d'avoir des polices globales (null) ou spécifiques à un client
  }
}, { timestamps: true });

const FontAsset = mongoose.model('FontAsset', fontAssetSchema);

// C'est cette ligne qui manquait probablement :
export default FontAsset;