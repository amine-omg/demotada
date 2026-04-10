import { GoogleGenerativeAI } from "@google/generative-ai";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { Agent } from 'https';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import fs from 'fs';
import Dossier from '../models/Dossier.js';
import { ceeRules } from '../knowledge/cee_rules.js';
import LotEmmy from '../models/LotEmmy.js';
import { PDFDocument, rgb } from 'pdf-lib';
import path from 'path';
import Entreprise from '../models/Entreprise.js';
import TarifCee from '../models/TarifCee.js';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- CONFIGURATION CLOUDFLARE R2 (Reprise de ton uploadController) ---
const secureAgent = new Agent({
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true,
});

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  requestHandler: new NodeHttpHandler({
    httpsAgent: secureAgent,
  }),
});
// -------------------------------------------------------------------

export const analyzeQuoteAndCreateDossier = async (req, res) => {
  try {
    if (!req.file) throw new Error("Aucun fichier reçu");
    
    // 1. UPLOAD VERS CLOUDFLARE R2
    const fileExtension = req.file.originalname.split('.').pop();
    const fileKey = `cee-demo/${nanoid()}.${fileExtension}`; // On le range dans un dossier cee-demo

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer, // Le fichier est en mémoire RAM
      ContentType: req.file.mimetype,
    }));

    const cloudflareUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;

    // 2. ANALYSE GEMINI (En utilisant le même buffer mémoire, ultra rapide)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    const prompt = `
      Tu es un auditeur expert en CEE et COFRAC. 
      Voici la base de connaissance officielle que tu dois utiliser pour tes calculs :
      """
      ${ceeRules}
      """

      Analyse ce document (devis ou fiche technique) et extrais les données suivantes au format JSON strictement valide :
      
      - "entreprise": Nom de l'installateur
      - "siret": Numéro SIRET (ou "Non détecté")
      - "type_travaux": Nature exacte des travaux
      - "fiche_cee": La fiche visée (ex: BAT-EN-101, BAR-TH-104).
      - "surface_quantite": Surface en m2 ou quantité (uniquement le nombre)
      - "montant_ttc": Montant total TTC
      
      - "analyse_geographique": Objet contenant "code_postal", "departement" (les 2 premiers chiffres), et "zone_climatique" (déduite de la base de connaissance).
      
      - "criteres_techniques": Objet clé/valeur des critères trouvés (ex: Résistance Thermique R, Epaisseur).
      
      - "simulation_kwh_cumac": Calcule le montant en kWh cumac total selon la formule de la base de connaissance (si c'est du tertiaire par défaut applique 0.6). Renvoie le calcul sous forme de string (ex: "2000 m2 * 2600 * 0.6 = 3 120 000 kWh cumac"). Si impossible, renvoie "Calcul impossible".
      
      - "decision_ia": Recommandation courte ("Conforme", "Attention R insuffisant", etc.).
      
      Ne renvoie QUE le JSON.
    `;

    const filePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"), // Plus besoin de fs.readFileSync !
        mimeType: req.file.mimetype
      }
    };

    const result = await model.generateContent([prompt, filePart]);
    let responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const iaData = JSON.parse(responseText);

    // 3. LOGIQUE MÉTIER & STATUT
    const isSiretMissing = !iaData.siret || iaData.siret.toLowerCase().includes('non');
    const hasWarning = iaData.decision_ia?.toLowerCase().includes('attention');
    const anomalyDetected = isSiretMissing || hasWarning;
    const initialStatus = anomalyDetected ? 'anomaly' : 'to_sign';

    // 4. SAUVEGARDE MONGODB
    const nouveauDossier = new Dossier({
      client: iaData.client || 'Client à définir',
      installateur: iaData.entreprise || 'Installateur inconnu',
      siret: iaData.siret,
      ficheCee: iaData.fiche_cee,
      montant: iaData.montant_ttc,
      surfaceQuantite: iaData.surface_quantite,
      auditIa: {
        criteresTechniques: iaData.criteres_techniques,
        decision: iaData.decision_ia,
        simulationPrime: iaData.simulation_kwh_cumac,
        hasAnomalies: anomalyDetected,
        zoneClimatique: iaData.analyse_geographique?.zone_climatique // On garde l'existant
      },
      // NOUVEAU : On injecte les données pour le front
      simulation: {
        ficheCee: iaData.fiche_cee || 'BAR-EN-101',
        parametresCalcul: {
          zoneClimatique: iaData.analyse_geographique?.zone_climatique,
          // Si tertiaire (BAT) = electricité/autre, on peut mettre une valeur par défaut ou l'extraire via l'IA plus tard
          dateBaremeUtilise: new Date() 
        }
      },
      documentOriginalUrl: cloudflareUrl,
      status: initialStatus
    });

    await nouveauDossier.save();

    res.json({ success: true, data: nouveauDossier });

  } catch (error) {
    console.error("Erreur d'analyse/création:", error);
    res.status(500).json({ success: false, error: "Erreur lors de la création du dossier" });
  }
};


// --- LA ROUTE POUR RÉCUPÉRER TOUS LES DOSSIERS (Pour le Dashboard) ---
export const getDossiers = async (req, res) => {
  try {
    const dossiers = await Dossier.find().sort({ createdAt: -1 });
    res.json({ success: true, data: dossiers });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export const getDossierById = async (req, res) => {
  try {
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, error: "Introuvable" });
    res.json({ success: true, data: dossier });
  } catch (error) {
    console.error("Erreur getDossierById:", error); // Ajoute ce log pour voir le souci dans ton terminal
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export const extractAHData = async (req, res) => {
  try {
    if (!req.file) throw new Error("Aucun fichier reçu");
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    // LE PROMPT SPÉCIFIQUE "GÉNÉRATION ATTESTATION SUR L'HONNEUR"
    const prompt = `
      Tu es un assistant administratif expert en dossiers CEE.
      Ton but est d'extraire les données de ce document (devis ou facture) pour pré-remplir l'Attestation sur l'Honneur (AH) de la fiche BAT-EN-101.
      
      Extrais les informations suivantes au format JSON strictement valide. Si une info n'est pas sur le document, renvoie une chaîne vide "".
      
      - "date_engagement": Date du devis
      - "nom_site": Nom du client ou de l'agence (ex: AGENCE A2BCD)
      - "adresse": L'adresse complète des travaux (rue)
      - "code_postal": Le code postal (ex: 78260)
      - "ville": La ville
      - "surface": La surface totale d'isolant en m2 (juste le chiffre)
      - "resistance_thermique": La valeur R (ex: 3,15)
      - "epaisseur": L'épaisseur en mm (ex: 115)
      - "marque": La marque de l'isolant (ex: Knauff)
      - "reference": La référence de l'isolant (ex: Fibrastyroc Clarte)
      
      Ne renvoie QUE le JSON, aucun texte avant ou après.
    `;

    // FIX REGRESSION: Utilisation de req.file.buffer au lieu de fs.readFileSync car multer est en memoryStorage
    const filePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype
      }
    };

    const result = await model.generateContent([prompt, filePart]);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    res.json({ success: true, data: JSON.parse(responseText) });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur d'extraction AH" });
  }
};


export const generateAHPdf = async (req, res) => {
  try {
    const formData = req.body;
    
    // 1. Charger le template vierge
    const templatePath = path.join(process.cwd(), 'knowledge', 'template_ah.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2. Aller sur la page 3 (l'index est 2 car on compte à partir de 0)
    const pages = pdfDoc.getPages();
    const formPage = pages[2];

    // Configuration de l'écriture (Noir, taille 10)
    const fontColor = rgb(0.1, 0.1, 0.1);
    const fontSize = 10;

    // ==========================================
    // LE LABORATOIRE DE COORDONNÉES (X, Y)
    // Attention : Dans pdf-lib, le point (0,0) est en BAS À GAUCHE de la page !
    // X = de gauche à droite / Y = de bas en haut
    // ==========================================

    const draw = (text, x, y) => {
      if (text) {
        formPage.drawText(String(text), { x, y, size: fontSize, color: fontColor });
      }
    };

    // NOUVELLES COORDONNÉES AJUSTÉES
    draw(formData.date_engagement, 335, 634); // Descendu de 120pts
    draw(formData.nom_site, 270, 565);        // Descendu et aligné
    draw(formData.adresse, 150, 553);         // Décalé à droite pour ne pas mordre le texte
    draw(formData.code_postal, 115, 530);     // Aligné sur le pointillé
    draw(formData.ville, 85, 518);            // Aligné sur le pointillé

    draw(formData.surface, 180, 383);         // Descendu près de "Surface"
    draw(formData.resistance_thermique, 210, 371); // Aligné
    draw(formData.epaisseur, 135, 336);       // Aligné

    draw(formData.marque, 115, 267);          // Descendu
    draw(formData.reference, 120, 256);       // Descendu

    // Cocher la case "Bureaux" (On dessine un "X" aux bonnes coordonnées)
    if (formData.secteur === 'Bureaux') {
       draw("X", 80, 520); 
    }

    // 3. Sauvegarder et envoyer au front
    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Attestation_Pre-remplie.pdf"');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error("Erreur génération PDF:", error);
    res.status(500).json({ success: false, error: "Erreur lors de la création du PDF" });
  }
};

export const updateDossierStatus = async (req, res) => {
  try {
    const { status, compliance, ahData } = req.body;
    
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, error: "Dossier introuvable" });

    if (status) dossier.status = status;
    if (ahData) dossier.ahData = ahData;
    
    // Fusion intelligente de la compliance
    if (compliance) {
      dossier.compliance = { ...dossier.compliance?.toObject(), ...compliance };
      
      // LE GARDE FOU RAI STRICT
      const dateEngagement = dossier.compliance.engagementDate;
      const dateRai = dossier.compliance.raiDate;

      if (dateEngagement && dateRai) {
        // On compare les dates pures (sans les heures pour être juste)
        const dEng = new Date(dateEngagement).setHours(0,0,0,0);
        const dRai = new Date(dateRai).setHours(0,0,0,0);

        if (dEng < dRai) {
          dossier.compliance.raiStatus = 'erreur_date';
        } else if (dossier.compliance.raiStatus === 'en_attente' || dossier.compliance.raiStatus === 'erreur_date') {
          // Si c'était en erreur mais que la date a été corrigée, on valide
          dossier.compliance.raiStatus = 'valide_plateforme';
        }
      }
    }

    await dossier.save(); // On utilise save() pour déclencher les hooks Mongoose
    
    res.json({ success: true, data: dossier });
  } catch (error) {
    console.error("Erreur updateDossierStatus:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};


// Récupérer toutes les entreprises
export const getEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.find().sort({ createdAt: -1 });
    res.json({ success: true, data: entreprises });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des entreprises" });
  }
};

// Créer une nouvelle entreprise (Mini-CRM)
export const createEntreprise = async (req, res) => {
  try {
    const { raisonSociale, siret, adresse, codePostal, ville, prenomContact, nomContact, emailContact, telephoneContact } = req.body;

    // Petite logique d'automatisation factice mais réaliste pour la démo
    let zoneCalc = 'H1';
    if (codePostal && (codePostal.startsWith('33') || codePostal.startsWith('13'))) zoneCalc = 'H2'; // Simplification démo
    
    let secteurCalc = 'Autres';
    // Si on avait une vraie API Sirene, on le mapperait ici. Pour la démo, on simule une déduction.
    if (raisonSociale.toLowerCase().includes('hotel') || raisonSociale.toLowerCase().includes('plaza')) secteurCalc = 'Hôtellerie / restauration';

    const nouvelleEntreprise = new Entreprise({
      raisonSociale,
      siret,
      adresse,
      codePostal,
      ville,
      zoneClimatique: zoneCalc,
      secteurDeduit: secteurCalc,
      contacts: [{
        prenom: prenomContact,
        nom: nomContact,
        email: emailContact,
        telephone: telephoneContact,
        isPrincipal: true
      }]
    });

    await nouvelleEntreprise.save();
    res.json({ success: true, data: nouvelleEntreprise });
  } catch (error) {
    console.error("Erreur création entreprise:", error);
    res.status(500).json({ success: false, error: "Erreur lors de la création (SIRET peut-être déjà existant ?)" });
  }
};

// Récupérer une entreprise par son ID
export const getEntrepriseById = async (req, res) => {
  try {
    const entreprise = await Entreprise.findById(req.params.id);
    if (!entreprise) return res.status(404).json({ success: false, error: "Entreprise introuvable" });
    res.json({ success: true, data: entreprise });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

// --- GESTION DES LOTS EMMY ---

export const getLotsEmmy = async (req, res) => {
  try {
    let lots = await LotEmmy.find().sort({ createdAt: -1 });

    // ASTUCE DÉMO : Si la table est vide, on injecte nos 3 lots de démo directement dans MongoDB
    if (lots.length === 0) {
      await LotEmmy.insertMany([
        { reference: 'LOT_EMMY_409', dossierCount: 142, volumeGwh: 124.5, valeurEstimee: 840500, status: 'draft' },
        { reference: 'LOT_EMMY_408', dossierCount: 310, volumeGwh: 280.1, valeurEstimee: 1890000, status: 'deposited', dateDepot: new Date('2026-04-01') },
        { reference: 'LOT_EMMY_407', dossierCount: 195, volumeGwh: 145.8, valeurEstimee: 984000, status: 'deposited', dateDepot: new Date('2026-03-15') }
      ]);
      lots = await LotEmmy.find().sort({ createdAt: -1 });
    }

    res.json({ success: true, data: lots });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export const getLotEmmyById = async (req, res) => {
  try {
    const lot = await LotEmmy.findById(req.params.id);
    if (!lot) return res.status(404).json({ success: false, error: "Lot introuvable" });
    res.json({ success: true, data: lot });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export const updateLotEmmyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lot = await LotEmmy.findByIdAndUpdate(req.params.id, { status, dateDepot: new Date() }, { new: true });
    res.json({ success: true, data: lot });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export const createLotEmmy = async (req, res) => {
  try {
    // On cherche le dernier lot pour incrémenter le numéro
    const lastLot = await LotEmmy.findOne().sort({ createdAt: -1 });
    let nextNumber = 410; // Valeur par défaut
    
    if (lastLot && lastLot.reference) {
      const parts = lastLot.reference.split('_');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    // On génère un nouveau lot "Brouillon" avec des data aléatoires crédibles
    const newLot = new LotEmmy({
      reference: `LOT_EMMY_${nextNumber}`,
      dossierCount: Math.floor(Math.random() * 50) + 100, // Entre 100 et 150 dossiers
      volumeGwh: parseFloat((Math.random() * 100 + 50).toFixed(1)), // Entre 50 et 150 GWh
      valeurEstimee: Math.floor(Math.random() * 500000) + 400000, // Entre 400k et 900k €
      status: 'draft'
    });

    await newLot.save();
    res.json({ success: true, data: newLot });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur lors de la création" });
  }
};

export const uploadRaiDocument = async (req, res) => {
  try {
    if (!req.file) throw new Error("Aucun fichier reçu");
    
    // 1. Upload sur Cloudflare R2
    const fileExtension = req.file.originalname.split('.').pop();
    const fileKey = `cee-demo/rai/${req.params.id}-${nanoid()}.${fileExtension}`; 

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const cloudflareUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;

    // 2. Mise à jour du dossier
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, error: "Dossier introuvable" });

    // On met à jour l'objet compliance
    dossier.compliance.raiProofUrl = cloudflareUrl;
    dossier.compliance.raiStatus = 'valide_document';
    dossier.compliance.preuveRai = {
      methode: 'document_upload',
      documentNom: req.file.originalname
    };
    // Optionnel : si tu veux forcer la date au moment de l'upload
    if (!dossier.compliance.raiDate) {
        dossier.compliance.raiDate = new Date();
    }

    await dossier.save();

    res.json({ success: true, data: dossier });
  } catch (error) {
    console.error("Erreur upload RAI:", error);
    res.status(500).json({ success: false, error: "Erreur lors de l'upload du document RAI" });
  }
};

// Mettre à jour une entreprise (Sauvegarder les données de l'API)
export const updateEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Retourne la nouvelle version mise à jour
    );
    if (!entreprise) return res.status(404).json({ success: false, error: "Entreprise introuvable" });
    
    res.json({ success: true, data: entreprise });
  } catch (error) {
    console.error("Erreur update entreprise:", error);
    res.status(500).json({ success: false, error: "Erreur serveur lors de la mise à jour" });
  }
};

export const getTarifs = async (req, res) => {
  try {
    let tarifs = await TarifCee.find().sort({ codeFiche: 1 });
    
    // ASTUCE DÉMO : Si la base est vide, on injecte les tarifs de base
    if (tarifs.length === 0) {
      await TarifCee.insertMany([
        { codeFiche: 'BAT-EN-101', nomFiche: 'Isolation de combles tertiaire', secteur: 'Tertiaire', prixMwhClassique: 6.50, prixMwhPrecaire: 6.50 },
        { codeFiche: 'BAT-EN-104', nomFiche: 'Remplacement de fenêtres tertiaire', secteur: 'Tertiaire', prixMwhClassique: 5.80, prixMwhPrecaire: 5.80 },
        { codeFiche: 'BAT-TH-116', nomFiche: 'Pompe à chaleur tertiaire', secteur: 'Tertiaire', prixMwhClassique: 7.20, prixMwhPrecaire: 7.20 }
      ]);
      tarifs = await TarifCee.find().sort({ codeFiche: 1 });
    }

    res.json({ success: true, data: tarifs });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur récupération tarifs" });
  }
};

// Mettre à jour un tarif (Le Moteur Pricing)
export const updateTarif = async (req, res) => {
  try {
    const tarif = await TarifCee.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!tarif) return res.status(404).json({ success: false, error: "Tarif introuvable" });
    res.json({ success: true, data: tarif });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur mise à jour tarif" });
  }
};

// Création manuelle d'un dossier (sans IA)
export const createDossier = async (req, res) => {
  try {
    const { client, installateur, status } = req.body;
    
    // On crée un objet conforme au modèle Dossier.js
    const nouveauDossier = new Dossier({
      client: client || 'Client Inconnu',
      installateur: installateur, // Requis par le modèle
      status: status || 'simulation',
      datesCles: { dateCreationPlateforme: new Date() }
    });

    await nouveauDossier.save();
    res.json({ success: true, data: nouveauDossier });
  } catch (error) {
    console.error("Erreur création manuelle:", error);
    res.status(500).json({ success: false, error: "Erreur lors de la création du dossier" });
  }
};