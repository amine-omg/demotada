// backend/models/Plan.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ex: "Syali Special", "Kernain Pro"
  slug: { type: String, required: true, unique: true }, // ex: "syali-special", "kernain-pro"
  
  // Identifiant de prix Stripe (pour le paiement réel)
  stripePriceId: { type: String, required: true }, 

  price: { type: Number, required: true }, // 4 ou 20
  currency: { type: String, default: 'EUR' },
  interval: { type: String, enum: ['month', 'year'], default: 'month' },

  // Quotas inclus
  features: {
    maxUsers: { type: Number, default: 1 },
    maxDocumentsPerMonth: { type: Number, default: 50 },
    storageLimitGB: { type: Number, default: 5 },
    hasHubspotIntegration: { type: Boolean, default: false },
    hasBlueprints: { type: Boolean, default: true }
  },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);