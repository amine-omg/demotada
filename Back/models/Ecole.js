import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const ecoleSchema = new mongoose.Schema({
  // --- Informations de base ---
  nom: {
    type: String,
    required: [true, "Le nom de l'école est obligatoire."],
    trim: true
  },
  adresse: {
    rue: { type: String, trim: true },
    ville: { type: String, trim: true },
    codePostal: { type: String, trim: true },
    pays: { type: String, trim: true }
  },
  siret: {
    type: String,
    unique: true,
    sparse: true, // Permet d'avoir plusieurs documents sans siret (valeur null)
    trim: true
  },
  logoUrl: {
    type: String,
    trim: true
  },
  slogan: { type: String, trim: true, maxlength: 200 },
  histoire: { type: String, trim: true, maxlength: 800 },
  dateDeFondation: { type: Date },
  videoPresentation: { type: String, trim: true },
  domaineCompetences: { type: [String], default: [] }, // Tableau de strings
  couleur1: { type: String, trim: true, default: '#B2E9E1' }, // Couleur principale par défaut
  couleur2: { type: String, trim: true, default: '#DCD8F4' }, // Couleur secondaire par défaut
  codeNAF: { type: String, trim: true },
  numeroTVA: { type: String, trim: true },
  googleAnalyticsID: { type: String, trim: true },
  zapierID: { type: String, trim: true },
  description: {
    type: String,
    trim: true
  },
  // --- NOUVEAUX CHAMPS : Handicap & Accessibilité ---
  // 1. Le Référent Handicap
  referentHandicapNom: { type: String, trim: true },
  referentHandicapEmail: { type: String, trim: true },
  referentHandicapTelephone: { type: String, trim: true },
  referentHandicapBio: { type: String, trim: true },

  // 2. Accessibilité des Locaux
  locauxAccessiblesPMR: { type: Boolean, default: false },
  detailsAccessibilite: { type: String, trim: true },

  // 3. Adaptations Pédagogiques
  mesuresPredefinies: { type: [String], default: [] },
  mesuresPersonnalisees: { type: [String], default: [] },
  
  // 4. Procédures et Engagements
  procedureAccueil: { type: String, trim: true },
  certificationsHandicap: { type: [String], default: [] },
  lienPolitiqueAccessibilite: { type: String, trim: true },
  // --- FIN DES NOUVEAUX CHAMPS ---
  website: {
    type: String,
    trim: true
  },
  
  facebookUrl: { type: String, trim: true },
  linkedinUrl: { type: String, trim: true },
  instagramUrl: { type: String, trim: true },
  tiktokUrl: { type: String, trim: true },

  supportEmail: { type: String, trim: true },
  supportTelephone: { type: String, trim: true },
  estCertificateur: {
    type: Boolean,
    default: false
  },

   crmId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(12) // Génère un ID unique de 12 caractères
  },
  // --- Champs de gestion ---
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'en_attente_de_validation'],
    default: 'actif'
  },
  administrateurs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assurez-vous que 'User' est le nom de votre modèle utilisateur
  }],

  // Ce champ n'est pas strictement nécessaire si vous avez `ecoleId` dans Formation,
  // mais il peut être utile pour certaines requêtes.
  formations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation' // Assurez-vous que 'Formation' est le nom de votre modèle de formation
  }]
}, {
  // Ajoute automatiquement les champs createdAt et updatedAt
  timestamps: true
});


const Ecole = mongoose.model('Ecole', ecoleSchema);

export default Ecole; // <--- C'est la ligne à corriger