import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  
  companyName: String,
  siret: String, // Pratique pour auto-remplir les factures
  
  tags: [String], // ex: ["Client", "Fournisseur", "VIP"]
  
  notes: String,
  lastInteractionAt: { type: Date } // Date du dernier document envoyé
}, { timestamps: true });

// Indexation pour la recherche rapide dans l'UI
contactSchema.index({ organizationId: 1, email: 1 });
contactSchema.index({ lastName: 1, firstName: 1 });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;