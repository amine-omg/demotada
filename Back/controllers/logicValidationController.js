import LogicValidation from '../models/LogicValidation.js';
import Template from '../models/Template.js';
import OcrLayer from '../models/OcrLayer.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeDocumentLogic = async (req, res) => {
  try {
    const { templateId } = req.body;
    const ocrData = await OcrLayer.findOne({ templateId });

    if (!ocrData || !ocrData.fullText) {
      return res.status(404).json({ success: false, message: "OCR manquant" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = `Analyse la cohérence de ce texte : "${ocrData.fullText}". Réponds en JSON pur avec les clés : isValid (boolean), errors (array), findings (object).`;

    const result = await model.generateContent(prompt);
    const logicData = JSON.parse(result.response.text().replace(/```json|```/g, ""));

    await Template.findByIdAndUpdate(templateId, { 'progress.logic': 'complete' });

    res.json({ success: true, logicData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const upsertValidation = async (req, res) => {
  try {
    const { templateId, fieldId, ruleType, config, errorManagement } = req.body;
    const validation = await LogicValidation.findOneAndUpdate(
      { templateId, fieldId },
      { ruleType, config, errorManagement },
      { new: true, upsert: true }
    );
    res.status(200).json(validation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getValidationsByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const validations = await LogicValidation.find({ templateId });
    res.status(200).json(validations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};