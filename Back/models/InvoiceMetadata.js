import mongoose from 'mongoose';

const invoiceMetadataSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  
  // Données émetteur/récepteur pour le XML
  sellerSiret: String,
  buyerSiret: String,
  vatNumber: String, // Numéro TVA Intracommunautaire
  
  // Détails des taxes (Array pour gérer plusieurs taux de TVA sur une facture)
  vatBreakdown: [{
    rate: Number, // ex: 20
    baseAmount: Number, // Montant HT pour ce taux
    vatAmount: Number    // Montant de la TVA pour ce taux
  }],

  // Spécificités Factur-X
  guid: String, // Identifiant unique du document pour les plateformes publiques (PPF)
  paymentTerms: String, // Conditions de paiement
  paymentMethod: { type: String, enum: ['transfer', 'card', 'check', 'cash'], default: 'transfer' },
  
  isExportedToChorus: { type: Boolean, default: false } // Pour le secteur public
}, { timestamps: true });

const InvoiceMetadata = mongoose.model('InvoiceMetadata', invoiceMetadataSchema);
export default InvoiceMetadata;