import SemanticContext from '../models/SemanticContext.js';
import OcrLayer from '../models/OcrLayer.js';
import Template from '../models/Template.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const createSemanticContext = async (req, res) => {
    try {
        const { name, identifierPatterns, category, organizationId, templateId } = req.body;
        const context = await SemanticContext.create({
            name,
            identifierPatterns,
            category,
            organizationId,
            templateId
        });
        res.status(201).json(context);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const identifyDocumentContext = async (req, res) => {
    try {
        const { templateId, forceRefresh = false } = req.body;

        const existingContext = await SemanticContext.findOne({ templateId });
        if (!forceRefresh && existingContext && existingContext.extractedData && Object.keys(existingContext.extractedData).length > 0) {
            return res.json({ 
                success: true, 
                context: existingContext, 
                extractedData: existingContext.extractedData, 
                cached: true 
            });
        }

        const ocrData = await OcrLayer.findOne({ templateId });
        if (!ocrData || !ocrData.fullText) {
            return res.status(404).json({ 
                success: false, 
                message: "Texte source introuvable. Veuillez scanner le document d'abord." 
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const prompt = `
            Analyse ce texte : "${ocrData.fullText}"
            MISSION : Identifie le type de doc et extrais les variables clés (Nom, Score, Date, ID).
            RÉPONSE : JSON pur uniquement.
            {
              "documentType": "string",
              "confidence": number,
              "data": { "client_name": "...", "score_value": "...", "execution_date": "...", "id_passage": "..." },
              "keywords": []
            }
        `;

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text().trim().replace(/```json|```/g, ""));

        const context = await SemanticContext.findOneAndUpdate(
            { templateId },
            { 
                documentType: data.documentType,
                confidenceScore: data.confidence,
                keywordsFound: data.keywords,
                extractedData: data.data 
            },
            { upsert: true, new: true }
        );

        await Template.findByIdAndUpdate(templateId, { 'progress.logic': 'complete' });

        res.json({ 
            success: true, 
            context, 
            extractedData: data.data, 
            cached: false 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSemanticByTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const context = await SemanticContext.findOne({ templateId });
        res.json(context);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
