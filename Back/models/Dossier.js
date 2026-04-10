import mongoose from 'mongoose';

const dossierSchema = new mongoose.Schema({
  client: { type: String, default: 'Client Inconnu' },
  installateur: { type: String, required: true },
  siret: { type: String },
  ficheCee: { type: String },
  montant: { type: String },
  surfaceQuantite: { type: String },
  
  // Données d'audit IA (Extraites lors du premier scan)
  auditIa: {
    criteresTechniques: { type: Map, of: String },
    decision: String,
    simulationPrime: String,
    hasAnomalies: { type: Boolean, default: false },
    zoneClimatique: String // Ajouté pour le calcul CEE
  },

  // Stockage des documents
  documentOriginalUrl: { type: String }, // Lien vers le devis (Cloudflare R2)
  attestationGenereeUrl: { type: String }, // Lien vers le PDF final scellé
  
  // Données précises pour l'Attestation AH (Générateur)
  ahData: {
    nom_site: String,
    adresse: String,
    code_postal: String,
    ville: String,
    date_engagement: String,
    surface: String,
    resistance_thermique: String,
    epaisseur: String,
    marque: String,
    reference: String,
    generatedPdfUrl: String, 
    isGenerated: { type: Boolean, default: false }
  },
  
  status: { 
    type: String, 
    enum: ['simulation', 'draft', 'to_sign', 'to_control', 'validated', 'anomaly','rejected'],
    default: 'simulation'
  },

  compliance: {
    // --- Champs Existants Conservés ---
    raiSent: { type: Boolean, default: false },
    raiDate: { type: Date },
    engagementDate: Date,      // Date de signature du devis (DOIT ÊTRE >= raiDate)
    workStartDate: Date,       // Date de début des travaux (DOIT ÊTRE > engagementDate + 7 jours)
    hasConvention: { type: Boolean, default: false }, 
    raiProofUrl: String,       // Preuve de l'envoi de l'incitation (Email/SMS horodaté) OR lien du doc uploadé

    // --- NOUVEAUTÉS : Gestion fine du statut RAI et de la méthode ---
    raiStatus: { 
      type: String, 
      enum: ['en_attente', 'valide_plateforme', 'valide_document', 'erreur_date'],
      default: 'en_attente'
    },
    preuveRai: {
      methode: { 
        type: String, 
        enum: ['sms', 'horodatage_creation', 'document_upload'] 
      },
      documentNom: { type: String } // Si la méthode est 'document_upload', permet de garder le nom du fichier original
    }
  },
  // LIAISON CRM
  entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
  commercialAssigne: { type: String, default: 'Non assigné' },

  // CHRONOLOGIE DETAILLEE (Inspiré de Consoneo)
  datesCles: {
    dateCreationPlateforme: { type: Date, default: Date.now },
    dateSignatureDevis: { type: Date }, // Garde-fou RAI
    demandeSimulation: { type: Date },
    offreEnvoyee: { type: Date },
    offreSignee: { type: Date },
    debutChantier: { type: Date },
    finChantier: { type: Date },
    factureRecue: { type: Date }
  },

  // MATRICE DOCUMENTAIRE (Au-delà du simple devis)
  documentsWorkflow: {
    offrePrime: { status: { type: String, default: 'absent' }, url: String },
    devis: { status: { type: String, default: 'absent' }, url: String },
    facture: { status: { type: String, default: 'absent' }, url: String },
    ah: { status: { type: String, default: 'absent' }, url: String }
  },

  // TAGS & FLAGS QUALITÉ
  flags: {
    forcerCofrac: { type: Boolean, default: false },
    controleQualiteRequis: { type: Boolean, default: false }
  },
  motsClefs: [{ type: String }], // Pour la recherche

  simulation: {
    // --- Champs Existants Conservés ---
    ficheCee: { type: String, default: 'BAR-EN-101' },
    kwhCumac: Number,
    primeEstimee: Number,
    profilBénéficiaire: { type: String, enum: ['classique', 'precaire', 'grand_precaire'] },
    
    // --- NOUVEAUTÉS : Paramètres de calcul détaillés pour justifier l'estimation ---
    parametresCalcul: {
      zoneClimatique: { type: String, enum: ['H1', 'H2', 'H3'] },
      energieChauffage: { type: String, enum: ['electricite', 'combustible'] },
      dateBaremeUtilise: { type: Date } // Pour tracer la réglementation en vigueur au moment du devis
    }
  }
}, { timestamps: true });

export default mongoose.model('Dossier', dossierSchema);