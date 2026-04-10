// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';


// INDISPENSABLES 

import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Comme tu es en "type": "module" (ESM), tu dois recréer le __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import subdomainMiddleware from './middleware/subdomainMiddleware.js';

// ==========================================
//          MODULE 1 : DOCUMENT MAPPER
// ==========================================

// 1. Structure & Fond
import templateRoutes from './routes/templateRoutes.js';   // Master Template - Fichier "maître" qui définit le fond et la structure du document.
import layoutRoutes from './routes/layoutRoutes.js';       // Dimensions pages - Définit les dimensions et la structure physique de chaque page.
import vectorRoutes from './routes/vectorRoutes.js';       // Background & Logos - Archive les tracés, logos et couleurs pour reconstruire le visuel original.
import fontAssetRoutes from './routes/fontAssetRoutes.js'; // Polices & Styles - Stocke les polices et styles pour une reproduction textuelle parfaite.


// 2. Analyse & Données
import ocrRoutes from './routes/ocrRoutes.js';             // Texte brut (Tesseract) - Couche de texte brut et indices de confiance pour les documents scannés.
import fieldRoutes from './routes/fieldRoutes.js';         // Zones de saisie - Stocke chaque case et ses coordonnées détectées par le moteur.
import semanticRoutes from './routes/semanticRoutes.js';   // Nature du doc (CERFA, etc.) - Identifie la nature du document (Facture, CERFA) pour appliquer les bons alias.
import aliasMapRoutes from './routes/aliasMapRoutes.js';   // Traduction sémantique - Dictionnaire intelligent pour le layer sémantique (traduit "Champ1" en "Nom").
import customFieldRoutes from './routes/customFieldRoutes.js'; // Champs clients - Pour que tes clients créent leurs propres types de champs (ex: "Numéro de matricule").
import typographyRoutes from './routes/typographyRoutes.js'; // Gère l'Hyphenation (césures) et le Color Matching.
import anchorPointRoutes from './routes/anchorPointRoutes.js'; // Gère l'inclinaison (rotation) et l'alignement Baseline.
import inkStyleRoutes from './routes/inkStyleRoutes.js';       // Gère la densité d'encre et le rendu réaliste des signatures.
import metadataRoutes from './routes/metadataRoutes.js';       // Standard-Compliance : Extraction et préservation des coordonnées millimétrées et métadonnées PDF.
import colorProfileRoutes from './routes/colorProfileRoutes.js'; // Mapping des profils colorimétriques (CMJN/RVB) pour impression.

// 3. Intelligence & Dynamisme
import anchorRoutes from './routes/anchorRoutes.js';       // Ancrage par mot-clé - Permet aux champs de rester attachés à un texte précis même si la mise en page du PDF change
import validationRoutes from './routes/validationRoutes.js'; // RegEx & Formats - Contraintes de formatage pour les données extraites (IBAN, SIRET).
import flowRoutes from './routes/flowRoutes.js';           // Paragraphes éditables - regroupe plusieurs lignes détectées par l'OCR pour en faire un bloc éditable cohérent dans Word.
import constraintRoutes from './routes/constraintRoutes.js'; // Cases fixes (Auto-shrink) - définit comment le texte doit se comporter quand il est "enfermé" dans une zone précise.
import semanticPatternRoutes from './routes/semanticPatternRoutes.js'; // Patterns de calcul (Base + TVA = TTC, BPF).
import annexManagerRoutes from './routes/annexManagerRoutes.js'; // Pilote la création automatique des pages d'annexes.
import logicValidationRoutes from './routes/logicValidationRoutes.js'; // Data-Validation : Vérification des dates, calculs de TVA et cohérence métier.
import layeringRoutes from './routes/layeringRoutes.js';         // Gestion du Z-Index (ordre de superposition des éléments).

// 4. Export & Auto-Apprentissage
import jobRoutes from './routes/jobRoutes.js';             // File d'attente (Progress) - Gestion de la file d'attente et du statut de l'analyse en temps réel.
import exportRoutes from './routes/exportRoutes.js';       // Configuration Word - Export document format word
import artifactRoutes from './routes/artifactRoutes.js';   // Fichiers générés - permet de proposer des formats différents (Excel pour les tableaux, JSON pour les API) 
import diffRoutes from './routes/diffRoutes.js';           // Comparaison visuelle (IA) - moteur de self correction automatique
import correctionRoutes from './routes/correctionRoutes.js'; // Mémoire corrective - t
import errorLogRoutes from './routes/errorLogRoutes.js';   // Logs d'erreurs techniques - Journal des anomalies de lecture pour l'optimisation continue.
import interactiveRoutes from './routes/interactiveRoutes.js'; // Gestion des champs de formulaire natifs et scripts PDF.
import documentPatchRoutes from './routes/documentPatchRoutes.js'; // modifier un document sans toucher au template original. C'est du versioning par couche.
import annexRoutes from './routes/annexRoutes.js'; // gère les fichiers physiques. Il fait le lien entre base de données et stockage
import tableStateRoutes from './routes/tableStateRoutes.js'; // gère la structure complexe des grilles (colonnes fixes, lignes..)

import certificationRoutes from './routes/certificationRoutes.js'; // Transparence Juridique : Génération du certificat d'authenticité et scellage des modifications.

// ==========================================
//        MODULE 2 : SIGNATURE & WORKFLOW
// ==========================================

// 1. Cœur du Workflow (L'Orchestration)
import envelopeRoutes from './routes/envelopeRoutes.js';      // Envelope.js — Unité de transport regroupant les documents et pilotant l'état du processus.
import signerRoutes from './routes/signerRoutes.js';          // Signer.js — Profil de la personne externe devant signer le document.
import workflowRoutes from './routes/workflowRoutes.js';      // WorkflowStep.js — Définit l'ordre de signature (séquentiel ou parallèle).
import recipientGroupRoutes from './routes/recipientGroupRoutes.js'; // RecipientsGroup.js — Permet d'envoyer à une liste où un seul membre doit signer.

// 2. Sécurité & Authentification (Le Blindage)
import smsAuthRoutes from './routes/smsAuthRoutes.js';        // SmsAuth.js — Gère les codes OTP pour la signature qualifiée ou l'authentification forte.
import certificateRoutes from './routes/certificateRoutes.js'; // Certificate.js — Coffre-fort stockant les informations des certificats numériques.
import sealRoutes from './routes/sealRoutes.js';              // Seal.js — Cachet électronique d'entreprise pour l'intégrité automatisée.

// 3. Preuve & Valeur Juridique (Le Dossier de Preuve)
import auditRoutes from './routes/auditRoutes.js';            // SignatureAudit.js — Garantit la valeur juridique de la signature devant un tribunal.
import evidenceRoutes from './routes/evidenceRoutes.js';      // EvidenceSummary.js — Génère le "Certificat d'Achèvement" (Hash, IP, Horodatage).
import declineRoutes from './routes/declineRoutes.js';        // DeclinedRecord.js — Archive les preuves et raisons en cas de refus de signature.

// ==========================================
//      MODULE 3 : GESTION SAAS & ORGA
// ==========================================

// 1. Structure Multi-Tenant (Isolation & Identité)
import tenantRoutes from './routes/tenantRoutes.js';         // Tenant.js — Gère l'isolation des données et les sous-domaines clients.
import organizationRoutes from './routes/organizationRoutes.js'; // Organization.js — Stocke les infos officielles imprimées sur les docs.
import userRoutes from './routes/userRoutes.js';             // User.js — Clients et collaborateurs de l'application.
import brandingRoutes from './routes/brandingRoutes.js';     // Branding.js — Configuration du Whitelabel (Logos, Couleurs).

// 2. Connectivité & API (Écosystème)
import apiKeyRoutes from './routes/apiKeyRoutes.js';         // ApiKey.js — Clés d'accès pour intégrer le moteur sur des sites tiers (Shopify, Wix).
import webhookRoutes from './routes/webhookRoutes.js';       // Webhook.js — Notifie les apps clientes lors d'événements (ex: Signature finie).
import storageRoutes from './routes/storageRoutes.js';       // StorageProvider.js — Gère l'export vers Google Drive, Dropbox ou S3 du client.

// 3. Volume & Business Logic
import usageRoutes from './routes/usageRoutes.js';           // UsageLog.js — Traque les actions pour la facturation à la consommation.
import bulkSendRoutes from './routes/bulkSendRoutes.js';     // BulkSend.js — Envoi massif d'un template à des centaines de destinataires.

//4. Gestion des blueprint
import blueprintRoutes from './routes/blueprintRoutes.js';    // Blueprint.js — Gère tes packs de templates "Maîtres" (BPF, Diplômes).

// ==========================================
//    MODULE 4 : GESTION ADMINISTRATIVE & CRM
// ==========================================

// 1. Intelligence Documentaire & Finance
import documentRoutes from './routes/documentRoutes.js';      // Document.js — Contient les données réelles et le lien vers le fichier final généré.
import tableRoutes from './routes/tableRoutes.js';            // TableStructure.js — "Cerveau" spécifique pour l'extraction de tableaux (Factures).
import invoiceRoutes from './routes/invoiceRoutes.js';        // InvoiceMetadata.js — Rend les PDF intelligents pour l'export comptable (TVA, Totaux).

// 2. CRM & Relation Client (Sales Stack)
import contactRoutes from './routes/contactRoutes.js';        // Contact.js — Carnet d'adresses global (Signataires récurrents).
import prospectRoutes from './routes/prospectRoutes.js';      // Prospect.js — Signataires potentiels avant conversion.
import opportunityRoutes from './routes/opportunityRoutes.js'; // Opportunite.js — Lie un client à un contrat ou une vente spécifique.
import crmConfigRoutes from './routes/crmConfigRoutes.js';    // CrmConfig.js — Configuration personnalisée du tunnel de vente client.
import hubspotRoutes from './routes/hubspotRoutes.js';        // HubSpot.js — Connecteur spécifique pour l'iframe et le mapping CRM.

// 3. Organisation & Classement
import folderRoutes from './routes/folderRoutes.js';          // Folder.js — Organisation des templates et documents par dossiers.
import categoryRoutes from './routes/categoryRoutes.js';      // Category.js — Classification par type de prestation ou nature du document.

// ==========================================
//      MODULE 5 : COMMUNICATION & SÉCURITÉ
// ==========================================

// 1. Automatisation & Alertes
import reminderRoutes from './routes/reminderRoutes.js';       // Reminder.js — Automatisation des relances pour les signataires en retard.
import notificationRoutes from './routes/notificationRoutes.js'; // Notification.js — Système d'alertes internes (In-app) et push.
import emailTemplateRoutes from './routes/emailTemplateRoutes.js'; // EmailTemplate.js — Personnalisation des emails envoyés par Kernain.

// 2. Collaboration & Messagerie
import conversationRoutes from './routes/conversationRoutes.js'; // Conversation.js — Gère les fils de discussion par document.
import messageRoutes from './routes/messageRoutes.js';           // Message.js — Le contenu des échanges entre collaborateurs/signataires.
import commentRoutes from './routes/commentRoutes.js';           // Comment.js — Espace de discussion collaboratif directement sur les documents.

// 3. Audit & Traçabilité
import activityLogRoutes from './routes/activityLogRoutes.js';   // ActivityLog.js — Audit de sécurité complet et historique des actions plateforme.

// ==========================================
//      MODULE 6 : BILLING & MONETIZATION
// ==========================================
import planRoutes from './routes/planRoutes.js';              // Plan.js — Définit les offres (Syali Special, Enterprise 20€).
import subscriptionRoutes from './routes/subscriptionRoutes.js'; // Subscription.js — Gère les abonnements Stripe et les quotas d'usage.


// juste pr voir

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
const mongoUri = process.env.MONGO_URI;

const allowedOrigins = [
  'http://localhost:5173',
  'https://demotada-1zyrks8wj-aminebellxs-projects.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autorise les requêtes sans origine (comme Postman ou mobiles) 
    // ou si l'origine est dans notre liste
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Refusé par CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // INDISPENSABLE car ton front a withCredentials: true
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(subdomainMiddleware);

// Connexion à MongoDB
mongoose.connect(mongoUri)
    .then(() => console.log('Connecté à MongoDB Atlas'))
    .catch(err => console.error('Erreur de connexion à MongoDB :', err));

app.use('/uploads', (req, res, next) => {
    // On ajoute l'en-tête qui autorise le partage de la ressource (l'image) cross-origin
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next(); // On passe la main au middleware suivant (express.static)
}, express.static('uploads'));

app.get('/api/tenant/config', (req, res) => {
    if (req.tenant) {
        res.json({
            found: true,
            name: req.tenant.name,
            customization: req.tenant.customization
        });
    } else {
        res.json({ found: false });
    }
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/conversation', conversationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/alias-maps', aliasMapRoutes);
app.use('/api/fonts', fontAssetRoutes);
app.use('/api/vectors', vectorRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/semantics', semanticRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/errors', errorLogRoutes);
app.use('/api/custom-fields', customFieldRoutes);
app.use('/api/anchors', anchorRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/artifacts', artifactRoutes);
app.use('/api/diffs', diffRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/envelopes', envelopeRoutes);
app.use('/api/signers', signerRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/recipient-groups', recipientGroupRoutes);
app.use('/api/sms-auth', smsAuthRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/seals', sealRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/declined', declineRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/bulk-send', bulkSendRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/prospects', prospectRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/crm-config', crmConfigRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/corrections', correctionRoutes);
app.use('/api/blueprints', blueprintRoutes);
app.use('/api/hubspot', hubspotRoutes);
app.use('/api/semantic-patterns', semanticPatternRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/patches', documentPatchRoutes);
app.use('/api/annexes', annexRoutes);
app.use('/api/table-states', tableStateRoutes);
app.use('/api/demo', demoRoutes);

// Routes de précision typographique
app.use('/api/typography', typographyRoutes);
app.use('/api/anchor-points', anchorPointRoutes);
app.use('/api/ink-styles', inkStyleRoutes);
app.use('/api/annex-manager', annexManagerRoutes);
// Routes de conformité et validation
app.use('/api/metadata', metadataRoutes);
app.use('/api/logic-validations', logicValidationRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/interactive', interactiveRoutes);
app.use('/api/color-profiles', colorProfileRoutes);
app.use('/api/layering', layeringRoutes);
app.use('/api/layout', layoutRoutes);


app.use('/knowledge', express.static('knowledge'));

app.get('/', (req, res) => {
    if (req.tenant) {
       res.send(`API Karnain pour le client ${req.tenant.name} en cours d'exécution!`);
    } else {
       res.send('API Karnain principale en cours d\'exécution!');
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
