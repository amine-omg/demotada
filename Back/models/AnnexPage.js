import mongoose from 'mongoose';

const annexPageSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blueprint',
    required: true,
    index: true
  },
  
  // 1. DÉCLENCHEURS (Triggers)
  // Pourquoi cette annexe doit-elle être générée ?
  triggerConfig: {
    type: String,
    enum: ['always', 'on-overflow', 'conditional'],
    default: 'always'
  },
  conditionField: { type: String }, // Ex: "Si 'Option_Accompagnement' est vrai dans HubSpot"
  
  // 2. LAYOUT DE L'ANNEXE
  layoutConfig: {
    headerTitle: { type: String, default: "Annexe" },
    showPageNumbers: { type: Boolean, default: true },
    inheritMainHeader: { type: Boolean, default: true }, // Reprend le logo/en-tête du doc principal
    maxRowsPerPage: { type: Number, default: 25 } // Pour les tableaux qui débordent
  },

  // 3. CONTENU DYNAMIQUE
  contentSource: {
    type: String,
    enum: ['static-pdf', 'dynamic-table', 'markdown-text'],
    required: true
  },
  staticFileUrl: { type: String }, // Si c'est un PDF fixe (ex: CGV)
  
  // Ordre d'apparition dans le document final
  sequenceOrder: { type: Number, default: 1 }

}, { timestamps: true });

const AnnexPage = mongoose.model('AnnexPage', annexPageSchema);
export default AnnexPage;