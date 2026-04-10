import mongoose from 'mongoose';

const colorProfileSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blueprint',
    required: true,
    unique: true,
    index: true
  },

  // 1. ESPACE COLORIMÉTRIQUE CIBLE
  targetSpace: {
    type: String,
    enum: ['sRGB', 'AdobeRGB', 'CMYK-Coated-FOGRA39', 'CMYK-Uncoated'],
    default: 'sRGB'
  },

  // 2. MAPPING DES TEINTES (Color Remapping)
  // Permet de forcer une correspondance entre une couleur détectée et une couleur de marque
  brandPalette: [{
    originalHex: { type: String }, // Couleur détectée sur le PDF source
    targetHex: { type: String },   // Couleur à utiliser pour l'injection (ex: Bleu Syali exact)
    description: { type: String }  // ex: "Couleur titre principal"
  }],

  // 3. RÉGLAGES D'IMPRESSION (Output Intent)
  outputSettings: {
    overprintBlack: { type: Boolean, default: true }, // Empêche les liserés blancs autour du texte noir
    intent: { 
      type: String, 
      enum: ['Perceptual', 'RelativeColorimetric', 'Saturation', 'AbsoluteColorimetric'],
      default: 'RelativeColorimetric'
    },
    embeddedProfile: { type: Boolean, default: true } // Inclure le profil ICC dans le fichier final
  }

}, { timestamps: true });

const ColorProfile = mongoose.model('ColorProfile', colorProfileSchema);
export default ColorProfile;