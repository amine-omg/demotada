// backend/services/generatorService.js
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

/**
 * Cette fonction est appelée par le bulkSendController
 */
export const triggerDocumentGeneration = async (data) => {
    try {
        console.log("Déclenchement de la génération via triggerDocumentGeneration...");
        // Logique pour traiter une demande de génération
        return { success: true, message: "Génération lancée" };
    } catch (error) {
        console.error("Erreur trigger:", error);
        throw error;
    }
};

export const generateDocument = async (templatePath, data) => {
    try {
        const existingPdfBytes = await fs.readFile(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error("Erreur génération PDF:", error);
        throw new Error("Échec de la génération du document.");
    }
};

export const prepareBulkDocuments = async (templateId, recipientList) => {
    console.log(`Préparation de ${recipientList.length} documents...`);
    return { batchId: Date.now(), count: recipientList.length };
};