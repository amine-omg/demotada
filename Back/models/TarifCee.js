import mongoose from 'mongoose';

const tarifCeeSchema = new mongoose.Schema({
  codeFiche: { type: String, required: true, unique: true }, // ex: 'BAT-EN-101'
  nomFiche: { type: String }, // ex: 'Isolation de combles'
  secteur: { type: String, enum: ['Tertiaire', 'Résidentiel', 'Industrie', 'Transport', 'Agriculture'] },
  
  // Les valeurs financières (Prix d'achat du kWh Cumac en €)
  prixMwhClassique: { type: Number, required: true, default: 6.00 }, // ex: 6.00 € le MWh
  prixMwhPrecaire: { type: Number, required: true, default: 6.50 },  // ex: 6.50 € le MWh
  
  // Paramètres de calcul spécifiques à la fiche
  dureeDeVie: { type: Number }, // ex: 30 ans pour l'isolation
  
  // Historisation et statut
  dateEffet: { type: Date, default: Date.now },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('TarifCee', tarifCeeSchema);