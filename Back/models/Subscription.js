// backend/models/Subscription.js
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  
  // Statut venant de Stripe (active, trialing, past_due, canceled)
  status: { type: String, required: true, default: 'active' },
  
  // Infos Stripe
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String, required: true },

  // Période de facturation
  currentPeriodStart: Date,
  currentPeriodEnd: Date,

  // Pour la gestion du volume (usage-based billing)
  extraUsageCharges: [{
    month: String, // ex: "2026-03"
    documentCount: { type: Number, default: 0 },
    amountCharged: Number
  }],

  cancelAtPeriodEnd: { type: Boolean, default: false }
}, { timestamps: true });

// Index pour vérifier rapidement si un client est à jour
subscriptionSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model('Subscription', subscriptionSchema);