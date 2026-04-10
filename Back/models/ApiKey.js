import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true }, // ex: "SDK Site Web", "Integration Zapier"
  
  key: { type: String, required: true, unique: true }, // Clé générée (ex: kn_live_...)
  secret: { type: String, required: true }, // Pour les appels serveurs sécurisés
  
  permissions: [{ 
    type: String, 
    enum: ['scan:write', 'docs:read', 'docs:write', 'sign:execute'], 
    default: ['docs:read'] 
  }],

  restrictions: {
    allowedDomains: [String], // Pour le CORS (SDK Frontend)
    allowedIps: [String]      // Pour la sécurité Backend
  },

  isActive: { type: Boolean, default: true },
  lastUsedAt: { type: Date }
}, { timestamps: true });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
export default ApiKey;