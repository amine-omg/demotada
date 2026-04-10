import { PDFDocument } from 'pdf-lib';
import Tesseract from 'tesseract.js';
import FontAsset from '../models/FontAsset.js';
import PageLayout from '../models/PageLayout.js';
import OcrLayer from '../models/OcrLayer.js';
import ProcessingJob from '../models/ProcessingJob.js';

class PdfParserService {
  /**
   * Point d'entrée principal pour analyser un nouveau template
   */
  async fullAnalyze(pdfBuffer, templateId, organizationId) {
    // 1. Créer un job de suivi
    const job = await ProcessingJob.create({
      organizationId,
      templateId,
      status: 'processing',
      currentStep: 'uploading'
    });

    try {
      // 2. Charger le document avec pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      // 3. Analyser la structure physique (Layout)
      await this.extractLayout(pages, templateId, job);

      // 4. Analyser le texte et l'OCR
      await this.extractTextAndOcr(pdfBuffer, templateId, job);

      // 5. Finalisation
      job.status = 'completed';
      job.progress = 100;
      await job.save();

      return { success: true, jobId: job._id };
    } catch (error) {
      job.status = 'failed';
      console.error('Erreur Analyse PDF:', error);
      await job.save();
      throw error;
    }
  }

  /**
   * Extrait les dimensions de chaque page
   */
  async extractLayout(pages, templateId, job) {
    job.currentStep = 'font_extraction';
    await job.save();

    for (let i = 0; i < pages.length; i++) {
      const { width, height } = pages[i].getSize();
      await PageLayout.create({
        templateId,
        pageNumber: i + 1,
        dimensions: { width, height, unit: 'pt' },
        orientation: width > height ? 'landscape' : 'portrait'
      });
    }
  }

  /**
   * Exécute l'OCR et l'extraction sémantique
   */
  async extractTextAndOcr(pdfBuffer, templateId, job) {
    job.currentStep = 'ocr_analysis';
    job.progress = 50;
    await job.save();

    // Note: Pour un PDF déjà textuel, on pourrait utiliser pdf-parse.
    // Ici, on prépare le moteur pour gérer TOUS les cas (images incluses).
    const result = await Tesseract.recognize(pdfBuffer, 'fra', {
      logger: m => console.log(m)
    });

    await OcrLayer.create({
      templateId,
      pageNumber: 1, // À boucler pour le multi-page
      fullText: result.data.text,
      blocks: result.data.blocks.map(b => ({
        text: b.text,
        confidence: b.confidence,
        bbox: { x0: b.bbox.x0, y0: b.bbox.y0, x1: b.bbox.x1, y1: b.bbox.y1 }
      }))
    });
  }
}

export default new PdfParserService();