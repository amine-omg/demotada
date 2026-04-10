import mongoose from 'mongoose';

const DataValidationRuleSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  fieldName: { type: String, required: true }, // ex: "iban_field"
  ruleType: { 
    type: String, 
    enum: ['regex', 'date_format', 'numeric_range', 'iban', 'siret', 'email'], 
    required: true 
  },
  pattern: { type: String }, // La regex ou le format (ex: "FR\d{12}...")
  errorMessage: { type: String, default: "Format de donnée invalide" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const DataValidationRule = mongoose.model('DataValidationRule', DataValidationRuleSchema);
export default DataValidationRule;