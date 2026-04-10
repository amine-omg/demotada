import mongoose from 'mongoose';

const lotEmmySchema = new mongoose.Schema({
  reference: { type: String, required: true },
  dossierCount: { type: Number, default: 0 },
  volumeGwh: { type: Number, default: 0 },
  valeurEstimee: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'sealed', 'deposited'], default: 'draft' },
  dateDepot: { type: Date }
}, { timestamps: true });

export default mongoose.model('LotEmmy', lotEmmySchema);