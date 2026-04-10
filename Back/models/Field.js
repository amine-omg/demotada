import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  
  // Mapping
  label: { type: String }, // Nom humain détecté au scan (ex: "Nom de l'élève")
  mappingKey: { type: String, required: true }, // Clé technique (ex: "user_lastname")
  
  type: { 
    type: String, 
    enum: ['text', 'checkbox', 'signature', 'date', 'table_row'], 
    default: 'text' 
  },

  // Positionnement Pixel-Perfect (en % ou en px selon ton choix de moteur)
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number }
  },

  // Style détecté
  styling: {
    fontFamily: { type: String, default: 'Arial' },
    fontSize: { type: Number, default: 12 },
    fontWeight: { type: String, default: 'normal' },
    color: { type: String, default: '#000000' },
    textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'left' }
  },

  isRequired: { type: Boolean, default: false },
  defaultValue: { type: String }
}, { timestamps: true });

const Field = mongoose.model('Field', fieldSchema);
export default Field;