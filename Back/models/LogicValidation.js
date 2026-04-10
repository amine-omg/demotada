import mongoose from 'mongoose';

const logicValidationSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blueprint',
    required: true,
    index: true
  },
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MappedField',
    required: true
  },

  // 1. TYPE DE LOGIQUE
  ruleType: {
    type: String,
    enum: ['date-range', 'math-formula', 'regex-pattern', 'vat-check', 'mandatory-if'],
    required: true
  },

  // 2. CONFIGURATION DE LA RÈGLE
  config: {
    // Pour math-formula : "price * quantity"
    formula: { type: String },
    // Pour date-range : "start_date < end_date"
    dependencyField: { type: String }, 
    // Pour regex : format SIRET, IBAN, etc.
    pattern: { type: String },
    // Pour vat-check : taux applicables (20, 10, 5.5, 0)
    allowedVatRates: [{ type: Number }]
  },

  // 3. ACTION EN CAS D'ERREUR
  errorManagement: {
    severity: { type: String, enum: ['block', 'warn'], default: 'block' },
    customMessage: { type: String, default: "La donnée saisie est invalide." }
  }

}, { timestamps: true });

logicValidationSchema.index({ templateId: 1, fieldId: 1 }, { unique: true });

const LogicValidation = mongoose.model('LogicValidation', logicValidationSchema);
export default LogicValidation;