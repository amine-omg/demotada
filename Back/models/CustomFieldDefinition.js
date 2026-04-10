import mongoose from 'mongoose';

const CustomFieldDefinitionSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  label: { type: String, required: true }, // ex: "Numéro de Sécurité Sociale"
  key: { type: String, required: true }, // ex: "ssn_number" (utilisé dans le code)
  fieldType: { 
    type: String, 
    enum: ['text', 'number', 'date', 'checkbox', 'dropdown'], 
    default: 'text' 
  },
  validationRegex: { type: String }, // Pour valider le format côté Front (ex: code postal)
  defaultValue: { type: String },
  isMandatory: { type: Boolean, default: false }
}, { timestamps: true });

const CustomFieldDefinition = mongoose.model('CustomFieldDefinition', CustomFieldDefinitionSchema);
export default CustomFieldDefinition;