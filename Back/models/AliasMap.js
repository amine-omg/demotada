import mongoose from 'mongoose';

const AliasMapSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  aliasName: { type: String, required: true }, // ex: "client_lastname"
  
  // Mapping vers les champs physiques détectés
  sourceFields: [{
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' } // Référence au champ dans Field.js
  }],
  
  // Intelligence sémantique
  semanticKeywords: [String], // ex: ["nom", "lastname", "patronyme"] pour l'auto-détection
  
  // Lien vers les métadonnées de facturation (si applicable)
  metadataRef: { type: mongoose.Schema.Types.ObjectId, ref: 'InvoiceMetadata' },
  
  transformationRule: {
    type: String,
    enum: ['uppercase', 'lowercase', 'capitalize', 'none'],
    default: 'none'
  }
}, { timestamps: true });

// Index pour recherche rapide lors du scan
AliasMapSchema.index({ organizationId: 1, aliasName: 1 });



const AliasMap = mongoose.model('AliasMap', AliasMapSchema);

export default AliasMap;