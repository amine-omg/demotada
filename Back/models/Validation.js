// backend/models/Validation.js
import mongoose from 'mongoose';

const validationSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  regex: { type: String }, // Pour les contraintes de format (ex: IBAN, Email)
  errorMessage: { type: String },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }
}, { timestamps: true });

const Validation = mongoose.model('Validation', validationSchema);
export default Validation;