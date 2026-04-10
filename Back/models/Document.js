// backend/models/Document.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const documentSchema = new Schema({
  // --- MÉTADONNÉES DE BASE ---
  title: { 
    type: String,
    required: true,
    trim: true,
  },
  description: { 
    type: String,
    default: '',
    trim: true,
  },
  type: { 
    // Fusion des types Syali (éducatif) et Kernain (business)
    type: String,
    enum: [
      'devoir', 'support', 'attestation', 'diplome', 'transactionnel', 
      'emargement', 'invoice', 'contract', 'form'
    ],
    required: true,
  },
  status: { 
    // Nouveau : Pour gérer le cycle de vie Kernain
    type: String, 
    enum: ['draft', 'pending', 'signed', 'paid', 'cancelled', 'validated', 'submitted'], 
    default: 'draft' 
  },

  // --- LIENS & RELATIONS ---
  organizationId: { // Le Tenant (Espace client)
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },
  templateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Template', 
    default: null,
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  session: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Session', 
    index: true,
    default: null,
  },
  formation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formation', 
    index: true,
    default: null,
  },
  relatedToUser: { // L'élève ou le client final concerné
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null,
  },

  // --- DATA & FICHIERS (Le coeur de Kernain) ---
  data: { 
    // Les données brutes injectées pour le mapping
    type: Object, 
    default: {} 
  },
  fileUrl: { // Fichier original ou support
    type: String,
    required: true,
  },
  pdfUrl: { // PDF généré par Kernain (rempli)
    type: String,
    default: null,
  },
  signedPdfUrl: { // PDF final après signature légale
    type: String,
    default: null,
  },

  // --- ÉDUCATIF (Syali Heritage) ---
  grade: { 
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  gradedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null,
  },
  isSubmitted: { 
    type: Boolean, 
    default: false,
  },
  submissionUrl: { 
    type: String, 
    default: null,
  },
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null,
  },

  // --- DATES & TRACKING ---
  dueDate: { type: Date, default: null }, // Échéance devoir ou facture
  issueDate: { type: Date, default: null }, // Émission
  submissionDate: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  viewedAt: { type: Date, default: null },
  signedAt: { type: Date, default: null },

  // --- FINANCIER & LÉGAL (Couche France) ---
  invoiceDetails: {
    number: { type: String }, // Numéro chrono (ex: F-2026-001)
    totalHT: { type: Number },
    totalTVA: { type: Number },
    totalTTC: { type: Number },
    currency: { type: String, default: 'EUR' },
    isFacturX: { type: Boolean, default: false } // Indique si le XML est injecté
  },

  isValidated: { 
    type: Boolean, 
    default: false,
  },

}, { timestamps: true });

// Index pour accélérer les recherches par organisation et type
documentSchema.index({ organizationId: 1, type: 1 });
documentSchema.index({ 'invoiceDetails.number': 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;