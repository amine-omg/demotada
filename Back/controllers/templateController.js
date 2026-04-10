import Template from '../models/Template.js';
import Field from '../models/Field.js';
import PdfParserService from '../services/PdfParserService.js';

// backend/controllers/templateController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import OcrLayer from '../models/OcrLayer.js'; // Si tu as un modèle pour stocker l'OCR

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runMagicScan = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Trouver le template
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ message: "Template introuvable" });

        // 2. Récupérer le PDF local (on utilise l'ID pour le nom du fichier)
        const pdfPath = path.join(process.cwd(), 'uploads', 'pdf', `${id}.pdf`);
        
        // Sécurité : si le fichier n'existe pas, on tente de le récupérer depuis l'URL stockée
        if (!fs.existsSync(pdfPath)) {
             console.log("Fichier non trouvé localement, vérification requise...");
             // Ici tu pourrais ajouter une logique de téléchargement si besoin
             return res.status(404).json({ message: "PDF source introuvable sur le serveur" });
        }

        const pdfBuffer = fs.readFileSync(pdfPath);

        // 3. Configuration de Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); // Flash est plus rapide pour le stream

        const prompt = `Tu es l'IA Karnain. Analyse ce document et extrait :
        1. "fullText": Le texte intégral du document.
        2. "blocks": Un tableau d'objets { text: string, x: number, y: number } (approxime les positions si possible).
        3. "metadata": { company, siren, date, code_securite }.
        
        Réponds UNIQUEMENT en JSON pur.`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: pdfBuffer.toString("base64"),
                    mimeType: "application/pdf"
                }
            },
            { text: prompt }
        ]);

        const responseText = result.response.text().replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(responseText);

        // 4. Mise à jour de la progression
        await Template.findByIdAndUpdate(id, { 
            'progress.ocr': 'complete',
            'status': 'active' 
        });

        // 5. Réponse structurée pour BackgroundMagic.vue
        res.status(200).json({
            success: true,
            data: {
                fullText: analysis.fullText,
                blocks: analysis.blocks || [],
                metadata: analysis.metadata
            }
        });

    } catch (error) {
        console.error("❌ Erreur Gemini Deep Scan:", error);
        res.status(500).json({ message: "Erreur lors de l'analyse IA", error: error.message });
    }
};

export const generateMasterBackground = async (req, res) => {
  try {
    const { templateId } = req.body;
    
    const sourceImagePath = path.join(process.cwd(), `uploads/backgrounds/${templateId}_p1.png`);
    const imageBuffer = fs.readFileSync(sourceImagePath);
    
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });
    
const prompt = `
Tu es un outil de nettoyage de documents professionnels. Ta seule mission est de transformer cette image en un fond de page (template) 100% vierge. 
RÈGLES STRICTES :
1. EFFACE ABSOLUMENT TOUT LE TEXTE, sans aucune exception (paragraphes, adresses email, numéros de téléphone, en-têtes de tableaux, dates, mentions légales).
2. S'il y a des lettres ou des chiffres, tu les remplaces par la couleur de fond correspondante.
3. CONSERVE INTACTS : Les lignes, les bordures des tableaux, les cases, les couleurs de fond, les formes géométriques et les logos (comme Urssaf ou Green Target).
Le résultat doit être une grille/feuille de papier peinte où l'on pourrait réécrire par-dessus.
`;
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/png"
        }
      }
    ]);

    const candidate = result.response.candidates[0];
    const imagePart = candidate.content.parts.find(p => p.inlineData);

    if (!imagePart) {
      throw new Error("L'IA n'a pas retourné d'image.");
    }

    const outputBase64 = imagePart.inlineData.data;
    const cleanFileName = `${templateId}_master.png`;
    const cleanImagePath = path.join(process.cwd(), `uploads/backgrounds/${cleanFileName}`);

    fs.writeFileSync(cleanImagePath, Buffer.from(outputBase64, 'base64'));

    res.json({
      success: true,
      masterUrl: `/uploads/backgrounds/${cleanFileName}`
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Créer un nouveau template et lancer l'analyse
// @route   POST /api/templates/upload
export const uploadTemplate = async (req, res) => {
    try {
        const { name, organizationId } = req.body;

        if (!req.files || !req.files.pdf) {
            return res.status(400).json({ message: "Aucun fichier PDF fourni." });
        }

        // 1. Création de l'entrée Template en base
        const template = await Template.create({
            name,
            organizationId,
            status: 'analyzing'
        });

        // 2. Lancement asynchrone du service d'analyse (PdfParserService)
        // On ne "wait" pas la fin de l'analyse pour répondre au front
        PdfParserService.fullAnalyze(req.files.pdf.data, template._id, organizationId);

        res.status(201).json({
            message: "Analyse du document lancée avec succès",
            templateId: template._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer un template avec tous ses champs détectés
// @route   GET /api/templates/:id
export const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ message: "Template introuvable" });

        const fields = await Field.find({ templateId: template._id });

        res.json({ template, fields });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const testDirectExtraction = async (req, res) => {
    try {
        console.log("📥 [TEST] Fichier reçu sur le serveur");

        // express-fileupload met le fichier ici
        if (!req.files || !req.files.pdf) {
            console.log("❌ [TEST] req.files.pdf est vide");
            return res.status(400).json({ success: false, message: "Aucun fichier reçu" });
        }

        const pdfBuffer = req.files.pdf.data;
        console.log(`📄 [TEST] Taille du buffer : ${pdfBuffer.length} bytes`);

        // On fait l'extraction SANS enregistrer sur Cloudflare
        const data = await pdf(pdfBuffer);
        
        console.log("✅ [TEST] Texte extrait avec succès");

        return res.status(200).json({
            success: true,
            text: data.text, // C'est ici que le texte brut est renvoyé
            length: data.text.length
        });

    } catch (error) {
        console.error("❌ [TEST] Erreur d'extraction :", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
