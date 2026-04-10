// backend/controllers/ocrController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import OcrLayer from '../models/OcrLayer.js';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import Template from '../models/Template.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration de pdf2json pour les ES Modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");

/**
 * Fonction utilitaire pour extraire le texte via pdf2json (Promisifiée)
 */
const extractTextWithPdf2Json = (filePath) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // mode texte brut
        pdfParser.on("pdfParser_dataError", (errData) => {
            console.error("❌ Erreur pdf2json:", errData.parserError);
            reject(errData.parserError);
        });
        pdfParser.on("pdfParser_dataReady", () => {
            const rawText = pdfParser.getRawTextContent();
            resolve(rawText || "");
        });
        pdfParser.loadPDF(filePath);
    });
};
export const processSmartOcr = async (req, res) => {
    try {
        const { templateId, forceRefresh = false } = req.body;
        if (!templateId) {
            return res.status(400).json({ success: false, message: "templateId est requis" });
        }

        const localPdfPath = path.join(process.cwd(), 'uploads', 'pdf', `${templateId}.pdf`);

        // --- ÉTAPE 1 : LOGIQUE DE RÉCUPÉRATION (SÉCURITÉ ANTI-RÉGRESSION) ---
        if (!fs.existsSync(localPdfPath)) {
            console.log("🔍 PDF local manquant. Tentative de récupération depuis R2...");
            const template = await Template.findById(templateId);
            if (!template) throw new Error("Template introuvable en BDD");

            // On utilise backgroundUrl qui contient le lien vers le PDF sur Cloudflare R2
            if (template.backgroundUrl) {
                console.log(`🚚 Rapatriement depuis : ${template.backgroundUrl}`);
                const response = await axios.get(template.backgroundUrl, { responseType: 'arraybuffer' });
                
                const dir = path.dirname(localPdfPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                
                fs.writeFileSync(localPdfPath, Buffer.from(response.data));
                console.log("✅ Fichier restauré localement avec succès.");
            } else {
                throw new Error("Aucune URL source disponible pour restaurer le fichier.");
            }
        }

        // --- ÉTAPE 2 : VÉRIFICATION DU CACHE (SMART CHECK) ---
        // On vérifie si la data existe déjà dans OcrLayer pour économiser Gemini
        const existingOcr = await OcrLayer.findOne({ templateId });
        
        if (!forceRefresh && existingOcr && existingOcr.fullText) {
            console.log("♻️ Cache Hit : Utilisation du texte déjà extrait en BDD.");
            
            // INDISPENSABLE : On s'assure que le voyant est vert en BDD
            await Template.findByIdAndUpdate(templateId, { 'progress.ocr': 'complete' });
            
            return res.status(200).json({ 
                success: true, 
                ocrData: existingOcr, 
                cached: true 
            });
        }

        // --- ÉTAPE 3 : ANALYSE HAUTE PRÉCISION (GEMINI 2.5 PRO) ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const pdfBuffer = fs.readFileSync(localPdfPath);
        
        console.log("🧠 Analyse haute précision avec Gemini 2.5 Pro (Mode Strict)...");

        const result = await model.generateContent([
            {
                inlineData: {
                    data: pdfBuffer.toString("base64"),
                    mimeType: "application/pdf"
                }
            },
            { 
                text: `Tu es un extracteur de texte brut haute précision. Ta mission est d'extraire l'intégralité du texte du document fourni.
                       
                       RÈGLES CRITIQUES :
                       1. Ne fournis AUCUNE introduction, commentaire ou conclusion (ex: PAS DE "Voici le texte").
                       2. Ne réponds qu'avec le texte brut extrait du document.
                       3. Conserve la mise en page originale autant que possible.
                       4. Si des éléments manquent, ne le mentionne pas.
                       5. Utilise '*** ### Page X' comme seul délimiteur entre les pages.` 
            },
        ]);

        const response = await result.response;
        const extractedText = response.text().trim();

        // --- ÉTAPE 4 : PERSISTANCE DANS OCRLAYER ET MISE À JOUR TEMPLATE ---
        // On enregistre le texte dans OcrLayer
        const ocrResult = await OcrLayer.findOneAndUpdate(
            { templateId: templateId, pageNumber: 1 },
            { 
                fullText: extractedText,
                engineUsed: 'GEMINI_2.5_PRO',
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        // On met à jour le statut dans le modèle Template pour allumer le voyant
        await Template.findByIdAndUpdate(templateId, { 'progress.ocr': 'complete' });

        res.status(200).json({ 
            success: true, 
            ocrData: ocrResult,
            cached: false 
        });

    } catch (error) {
        console.error("❌ Erreur processSmartOcr:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOcrByTemplate = async (req, res) => {
    try {
        const data = await OcrLayer.find({ templateId: req.params.templateId }).sort({ pageNumber: 1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveOcrData = async (req, res) => {
    try {
        const { templateId, pageNumber, fullText, blocks } = req.body;
        const ocrData = await OcrLayer.findOneAndUpdate(
            { templateId, pageNumber },
            { fullText, blocks },
            { upsert: true, new: true }
        );
        res.status(201).json(ocrData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};