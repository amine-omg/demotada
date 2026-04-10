// backend/models/EmailTemplate.js
import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  // Nom du template visible par l'utilisateur (ex: "Convocation à la session")
  nom: {
    type: String,
    required: true,
    trim: true,
  },
  // Identifiant unique pour le code (ex: "APPRENANT_CONVOCATION")
  type: {
    type: String,
    required: true,
    unique: true, // Chaque type de template est unique par école
    trim: true,
  },
  sujet: {
    type: String,
    required: true,
  },
  corps: {
    type: String, // Contiendra le corps du mail, potentiellement en HTML
    required: true,
  },
  // La liste des variables que l'utilisateur peut insérer dans ce template
  variablesDisponibles: [{
    tag: String, // ex: {{nom_apprenant}}
    description: String, // ex: Nom de l'apprenant
  }],
  // Lien vers l'école à qui appartient ce template
  ecole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ecole',
    required: true,
  },
  // Est-ce un template par défaut fourni par Syali ?
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Assurer que le 'type' est unique pour une même école
emailTemplateSchema.index({ ecole: 1, type: 1 }, { unique: true });

const defaultTemplates = [
    // --- Cycle de l'Apprenant ---
    {
        nom: "Confirmation d'inscription",
        type: 'APPRENANT_CONFIRMATION_INSCRIPTION',
        sujet: 'Bienvenue à la formation {{nom_formation}}',
        corps: 'Bonjour {{prenom_apprenant}},<br><br>Nous avons le plaisir de vous confirmer votre inscription à la formation {{nom_formation}}.<br>Vous recevrez bientôt votre convocation.<br><br>Cordialement,<br>L\'équipe de {{nom_organisme}}',
        variablesDisponibles: [
            { tag: '{{prenom_apprenant}}', description: 'Prénom de l\'apprenant' },
            { tag: '{{nom_apprenant}}', description: 'Nom de l\'apprenant' },
            { tag: '{{nom_formation}}', description: 'Nom de la formation' },
            { tag: '{{nom_organisme}}', description: 'Nom de votre établissement' },
        ]
    },
    {
        nom: 'Convocation à la session',
        type: 'APPRENANT_CONVOCATION',
        sujet: 'Votre convocation pour la session {{nom_session}}',
        corps: "Bonjour {{prenom_apprenant}},<br><br>Vous trouverez en pièce jointe votre convocation pour la session {{nom_session}} qui débutera le {{date_debut_session}}.<br>Connectez-vous à votre espace personnel pour plus d'informations : {{lien_extranet}}.<br><br>Cordialement,<br>L'équipe de {{nom_organisme}}",
        variablesDisponibles: [
            { tag: '{{prenom_apprenant}}', description: 'Prénom de l\'apprenant' },
            { tag: '{{nom_session}}', description: 'Titre de la session' },
            { tag: '{{date_debut_session}}', description: 'Date de début de la session' },
            { tag: '{{lien_extranet}}', description: 'Lien vers l\'extranet' },
            { tag: '{{nom_organisme}}', description: 'Nom de votre établissement' },
        ]
    },
    // ... Ajoutez ici d'autres templates sur le même modèle ...
];

// Fonction pour créer tous les templates par défaut pour une nouvelle école
emailTemplateSchema.statics.createDefaultTemplatesForEcole = async function(ecoleId) {
  try {
    const templatesToCreate = defaultTemplates.map(template => ({
      ...template,
      ecole: ecoleId,
      isDefault: true,
    }));
    await this.insertMany(templatesToCreate);
    console.log(`Templates par défaut créés pour l'école ${ecoleId}`);
  } catch (error) {
    console.error("Erreur lors de la création des templates par défaut pour l'école:", error);
  }
};

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;