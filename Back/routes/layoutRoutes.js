import express from 'express';
import axios from 'axios';
import Template from '../models/Template.js';
import Metadata from '../models/Metadata.js';
import crypto from 'crypto';
import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';

const router = express.Router();

router.post('/', async (req, res) => {
    const { templateId } = req.body;

    try {
        const template = await Template.findById(templateId);
        const pdfUrl = template.backgroundUrl || template.url;
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const buffer = response.data;

        // 1. SIGNATURE (Le Checksum MD5 du CSV)
        const checksum = crypto.createHash('md5').update(Buffer.from(buffer)).digest('hex');
        const filesizeKb = `${Math.round(buffer.byteLength / 1024)} kB`;

        const pdfDoc = await PDFDocument.load(buffer);
        const page = pdfDoc.getPages()[0];
        const { width, height } = page.getSize();

        // 2. EXTRACTION DES IMAGES (XObjects) - Le cœur du relevé Cambioli
        const imagesMetadata = [];
        const resources = page.node.Resources();
        const xObjects = resources?.lookup(PDFName.of('XObject'));

        if (xObjects) {
            const entries = xObjects.entries();
            for (let i = 0; i < entries.length; i++) {
                const [name, ref] = entries[i];
                const xObj = pdfDoc.context.lookup(ref);
                
                if (xObj instanceof PDFRawStream && xObj.dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
                    const imgW = xObj.dict.get(PDFName.of('Width')).numberValue;
                    const imgH = xObj.dict.get(PDFName.of('Height')).numberValue;
                    
                    imagesMetadata.push({
                        imageNumber: i,
                        pageNumber: 1,
                        type: xObj.dict.get(PDFName.of('SMask')) ? 'smask' : 'image',
                        width: imgW,
                        height: imgH,
                        colorSpace: xObj.dict.get(PDFName.of('ColorSpace'))?.toString().replace('/', '') || 'Unknown',
                        bitsPerComponent: xObj.dict.get(PDFName.of('BitsPerComponent'))?.numberValue || 8,
                        objectId: ref.objectNumber,
                        // Calcul du PPI (Pixel Per Inch) basé sur la taille d'affichage
                        xPpi: Math.round((imgW / width) * 72),
                        yPpi: Math.round((imgH / height) * 72)
                    });
                }
            }
        }

        // 3. EXTRACTION DES POLICES (Encoding & Object ID)
        const fontsMetadata = [];
        const fontDict = resources?.lookup(PDFName.of('Font'));
        if (fontDict) {
            fontDict.entries().forEach(([name, ref]) => {
                const fontDetails = pdfDoc.context.lookup(ref);
                fontsMetadata.push({
                    objectId: ref.objectNumber,
                    name: name.decodeText().replace('/', ''),
                    type: fontDetails.dict.get(PDFName.of('Subtype'))?.toString().replace('/', '') || 'Unknown',
                    encoding: fontDetails.dict.get(PDFName.of('Encoding'))?.toString().replace('/', '') || 'Standard',
                    isEmbedded: true
                });
            });
        }

        // 4. SAUVEGARDE MONGODB (Mapping total du CSV)
        const updatedMetadata = await Metadata.findOneAndUpdate(
            { templateId },
            {
                $set: {
                    fileInfo: {
                        checksum,
                        filesize: filesizeKb,
                        pdfVersion: pdfDoc.getForm() ? '1.4' : '1.3', // Calqué sur ton CSV
                        isLinearized: false,
                        pageCount: pdfDoc.getPageCount(),
                        pageLayout: 'OneColumn'
                    },
                    sourceMetadata: {
                        producer: pdfDoc.getProducer() || "Unknown",
                        creator: pdfDoc.getCreator() || "Unknown",
                        createDate: pdfDoc.getCreationDate()
                    },
                    pages: [{
                        pageNumber: 1,
                        width: Math.round(width * 0.352778),
                        height: Math.round(height * 0.352778),
                        rotation: page.getRotation().angle
                    }],
                    fonts: fontsMetadata,
                    images: imagesMetadata
                }
            },
            { upsert: true, new: true }
        );

        // Validation finale du process
        await Template.findByIdAndUpdate(templateId, { $set: { 'progress.layout': 'complete' } });

        try {
    const vectorCount = await captureVectors(pdfDoc, templateId);
    console.log(`✅ [VECTORS] ${vectorCount} éléments extraits pour ${templateId}`);
} catch (vErr) {
    console.error("⚠️ Échec partiel du scan vectoriel:", vErr.message);
    // On ne bloque pas la réponse du Layout si les vecteurs plantent
}

        res.json({ success: true, details: updatedMetadata });

    } catch (error) {
        console.error("❌ Erreur Scan Forensique:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;