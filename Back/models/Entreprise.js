import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  prenom: String,
  nom: String,
  email: String,
  telephone: String,
  fonction: String,
  isPrincipal: { type: Boolean, default: false }
});

const entrepriseSchema = new mongoose.Schema({
  raisonSociale: { type: String, required: true },
  siret: { type: String, required: true, unique: true },
  
  // -- Localisation --
  adresse: String,
  codePostal: String,
  ville: String,
  zoneClimatique: { type: String, enum: ['H1', 'H2', 'H3'] }, // Déduite du code postal

  // -- Pour l'automatisation de la simulation & l'API --
  codeNaf: String, 
  libelleNaf: String, // Pour afficher "Hôtels et hébergement similaire"
  estActive: { type: Boolean, default: true }, // true = Active (A), false = Fermée/Radiée (C)
  secteurDeduit: { type: String, enum: ['Bureaux', 'Enseignement', 'Commerce', 'Hôtellerie / restauration', 'Santé', 'Autres', 'Industrie'] },

  qualifications: {
    rgeRequis: { type: Boolean, default: false },
    rgeValide: { type: Boolean, default: false },
    numeroRge: { type: String },
    dateExpirationRge: { type: Date },
    organismes: [{ type: String }],
    // On ajoute un tableau pour stocker toutes les certifs détaillées
    details: [{
      domaine: String,
      organisme: String,
      qualification: String,
      expiration: Date
    }]
  },

  // -- NOUVEAU : Suivi Qualité & Audits (PNCEE / COFRAC) --
  auditQualite: {
    noteMoyenne: { type: Number, min: 0, max: 10 }, // Note sur 10
    nombreAudits: { type: Number, default: 0 },
    statut: { 
      type: String, 
      enum: ['Excellent', 'Conforme', 'Sous surveillance', 'Suspendu', 'Non évalué'], 
      default: 'Non évalué' 
    }
  },

  // -- Les contacts --
  contacts: [contactSchema],

  // -- Le côté CRM / Workflow --
  type: { type: String, enum: ['client_tertiaire', 'bureau_etude', 'installateur'], default: 'client_tertiaire' },
  statutValidation: { type: String, enum: ['en_attente', 'valide', 'refuse'], default: 'en_attente' },
  
  // -- Métriques (Stats) --
  stats: {
    dossiersEnCours: { type: Number, default: 0 },
    dossiersTermines: { type: Number, default: 0 },
    mwhCumacTotal: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('Entreprise', entrepriseSchema);