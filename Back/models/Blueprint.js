// backend/models/Blueprint.js
import mongoose from 'mongoose';

const blueprintSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ex: "Certificat de Réalisation Qualiopi"
  category: { 
    type: String, 
    enum: ['diploma', 'assessment', 'attendance', 'administrative', 'bpf'], 
    required: true 
  },
  
  // Le document de référence (ton PDF parfait)
  masterTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  
  description: String,
  version: { type: String, default: "1.0.0" },
  
  // Pour la vente
  isPremium: { type: Boolean, default: false }, // Si true -> 20€/mois, si false -> inclus Syali
  
  // Les tags pour aider le moteur à trouver les champs automatiquement
  suggestedMapping: [{
    sourceKey: String, // ex: "student_name"
    pdfFieldLabel: String // ex: "Nom de l'apprenant"
  }]
}, { timestamps: true });

export default mongoose.model('Blueprint', blueprintSchema);