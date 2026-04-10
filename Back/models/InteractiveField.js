import mongoose from 'mongoose';

const interactiveFieldSchema = new mongoose.Schema({
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

  // 1. TYPE DE COMPOSANT PDF NATIF
  fieldType: {
    type: String,
    enum: ['text-input', 'checkbox', 'radio-group', 'dropdown', 'signature-pad'],
    required: true
  },

  // 2. COMPORTEMENT ET SCRIPTS
  behavior: {
    isReadOnly: { type: Boolean, default: false },
    isMandatory: { type: Boolean, default: false },
    maxLength: { type: Number },
    // Script JS optionnel intégré au PDF (ex: calcul automatique de somme)
    pdfScript: { type: String }, 
    toolTip: { type: String } // Texte d'aide au survol
  },

  // 3. OPTIONS (Pour Dropdowns ou Radio-Groups)
  options: [{
    label: { type: String },
    value: { type: String }
  }]

}, { timestamps: true });

interactiveFieldSchema.index({ templateId: 1, fieldId: 1 }, { unique: true });

const InteractiveField = mongoose.model('InteractiveField', interactiveFieldSchema);
export default InteractiveField;