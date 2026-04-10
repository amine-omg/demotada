// backend/models/Tenant.js
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // Important pour la performance des recherches
  },
  customization: {
    logoUrl: { type: String, default: null },
    primaryColor: { type: String, default: '#423C74' }, // Couleur par défaut de Syali
    welcomeMessage: { type: String, default: null }
  },
  // Vous pouvez ajouter d'autres champs spécifiques au client
  // par exemple, un lien vers les utilisateurs de cette entreprise
  // users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
