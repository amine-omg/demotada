import mongoose from 'mongoose';

const SealSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true }, // ex: "Cachet Officiel Direction Financière"
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  sealType: { type: String, default: 'eIDAS_Advanced' },
  usageCount: { type: Number, default: 0 },
  lastUsedAt: { Date },
  settings: {
    appearance: {
      showTimestamp: { type: Boolean, default: true },
      customLogo: { type: String }, // URL vers l'image du cachet
      reason: { type: String, default: "Intégrité du document garantie par Kernain" }
    }
  }
}, { timestamps: true });

const Seal = mongoose.model('Seal', SealSchema);
export default Seal;