import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  // Identité Légale
  legalName: { type: String, required: true },
  siret: { type: String, required: true },
  legalForm: String, // SAS, SARL, Auto-entrepreneur...
  capital: Number,
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: { type: String, default: 'France' }
  },
  
  // Branding (Pour injecter dans les templates automatiquement)
  logoUrl: String,
  primaryColor: String, // Code Hexa (ex: #FF5500)
  fontFamily: { type: String, default: 'Arial' },
  
  // Coordonnées bancaires (Pour les factures)
  iban: String,
  bic: String,
  bankName: String,

  settings: {
    defaultVatRate: { type: Number, default: 20 },
    invoicePrefix: { type: String, default: 'INV-' }
  }
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;