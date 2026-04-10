// backend/models/Branding.js
import mongoose from 'mongoose';

const BrandingSchema = new mongoose.Schema({
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  logoUrl: { type: String }, // Logo en haut de l'interface de signature
  primaryColor: { type: String, default: '#007bff' }, // Couleur des boutons
  secondaryColor: { type: String, default: '#6c757d' },
  customDomain: { type: String }, // ex: signature.client.com
  emailFooter: { type: String },
  hideKernainLogo: { type: Boolean, default: false },
  socialLinks: {
    website: String,
    supportEmail: String
  }
}, { timestamps: true });

// LA CORRECTION : Vérifier si le modèle existe déjà dans l'instance Mongoose
// Cela empêche l'erreur "Cannot overwrite `Branding` model once compiled."
const Branding = mongoose.models.Branding || mongoose.model('Branding', BrandingSchema);

export default Branding;