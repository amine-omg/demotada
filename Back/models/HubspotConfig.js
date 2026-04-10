// backend/models/HubspotConfig.js
import mongoose from 'mongoose';

const hubspotConfigSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  // Identifiant unique du portail client HubSpot
  portalId: { type: String, required: true, unique: true },
  
  // Tokens d'accès (OAuth)
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,

  // Le Mapping : lie une propriété HubSpot à un Alias Kernain
  // Exemple : { "dealname": "contract_title", "amount": "total_price" }
  fieldMappings: {
    type: Map,
    of: String
  },

  // Historique des générations via HubSpot
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('HubspotConfig', hubspotConfigSchema);