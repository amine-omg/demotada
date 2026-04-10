import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import axios from 'axios';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { pdf } from 'pdf-to-img';
import VectorGraphic from '../models/VectorGraphic.js';
import Template from '../models/Template.js';

export const extractVectorsAction = async (req, res) => {
    const { templateId } = req.body;
    
    try {
        const templateData = await Template.findById(templateId);
        if (!templateData) return res.status(404).json({ success: false });

        const localPdfPath = path.join(process.cwd(), 'uploads', 'pdf', `${templateId}.pdf`);
        const backgroundPath = path.join(process.cwd(), 'uploads', 'backgrounds', `${templateId}_p1.png`);
        const vecDir = path.join(process.cwd(), 'uploads', 'vectors');
        
        if (!fs.existsSync(vecDir)) fs.mkdirSync(vecDir, { recursive: true });

        // Vérification de sécurité
        if (!fs.existsSync(localPdfPath) || !fs.existsSync(backgroundPath)) {
            return res.status(404).json({ 
                success: false, 
                message: "Fichiers sources manquants en local. Relancez un upload." 
            });
        }

        // 2. Lecture directe du PDF local (Plus besoin de télécharger avec Axios !)
        const pdfBuffer = fs.readFileSync(localPdfPath);

        // 3. Analyse structurelle (pdf-lib)
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const page1 = pdfDoc.getPages()[0];
        const { width: pdfWidth, height: pdfHeight } = page1.getSize();
        
        // On récupère les métadonnées de l'image de fond pour le calcul du crop
        const bgMetadata = await sharp(backgroundPath).metadata();
        const widthMultiplier = bgMetadata.width / pdfWidth;
        const heightMultiplier = bgMetadata.height / pdfHeight;

        await VectorGraphic.deleteMany({ templateId });

        // 4. Extraction des XObjects (Images et Formes)
        const elements = [];
        const resources = page1.node.Resources();
        const xObjects = resources?.lookup(PDFName.of('XObject'));

        if (xObjects) {
            const entries = xObjects.entries();
            for (let j = 0; j < entries.length; j++) {
                const [name, ref] = entries[j];
                const xObj = pdfDoc.context.lookup(ref);

                if (xObj instanceof PDFRawStream && xObj.dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
                    const fileName = `logo_${templateId}_${j}.png`;
                    const logoPath = path.join(vecDir, fileName);

                    const box = { x: 20, y: 20, width: 100, height: 100 }; 

                    try {
                        await sharp(backgroundPath)
                            .extract({
                                left: Math.round(box.x * widthMultiplier),
                                top: Math.round(box.y * heightMultiplier),
                                width: Math.round(box.width * widthMultiplier),
                                height: Math.round(box.height * heightMultiplier)
                            })
                            .png()
                            .toFile(logoPath);

                        elements.push({
                            templateId,
                            type: 'image',
                            name: `Asset_${j + 1}`,
                            pageNumber: 1,
                            boundingBox: { x: 5, y: 5, width: 15, height: 10 },
                            originalImageUrl: `/uploads/vectors/${fileName}`,
                            isEditable: true,
                            zIndex: j + 1
                        });
                    } catch (sharpErr) {
                        console.warn(`Crop ignoré pour l'objet ${j}:`, sharpErr.message);
                    }
                }
            }
        }

        if (elements.length > 0) await VectorGraphic.insertMany(elements);

        // 5. Mise à jour du statut
        templateData.progress.vectors = 'complete';
        templateData.markModified('progress');
        await templateData.save();

        res.status(200).json({ 
            success: true, 
            count: elements.length, 
            backgroundUrl: `/uploads/backgrounds/${templateId}_p1.png`,
            vectors: elements 
        });

    } catch (error) {
        console.error("Vector Extraction Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVectorsByTemplate = async (req, res) => {
    try {
        const vectors = await VectorGraphic.find({ templateId: req.params.templateId });
        res.json(vectors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveVectors = async (req, res) => {
    try {
        const vector = await VectorGraphic.create(req.body);
        res.status(201).json(vector);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cleanBackgroundAction = async (req, res) => {
    const { templateId, zonesToClean } = req.body; 

    try {
        const bgDir = path.join(process.cwd(), 'uploads', 'backgrounds');
        const sourcePath = path.join(bgDir, `${templateId}_p1.png`);
        const outputPath = path.join(bgDir, `${templateId}_master_bg.png`);

        // Si l'étape OCR n'a pas encore envoyé de zones, on peut avoir un fallback
        const finalZones = zonesToClean || []; 

        // Préparation des "pansements" (rectangles qui matchent le fond)
        const compositeOperations = finalZones.map(zone => ({
            input: {
                create: {
                    width: Math.round(zone.w),
                    height: Math.round(zone.h),
                    channels: 4,
                    // Ici on pourrait même moyenner la couleur de la zone pour l'inpainting
                    background: { r: 255, g: 255, b: 255, alpha: 1 } 
                }
            },
            left: Math.round(zone.x),
            top: Math.round(zone.y)
        }));

        let image = sharp(sourcePath);

        if (compositeOperations.length > 0) {
            image = image.composite(compositeOperations);
        }

        await image.png().toFile(outputPath);

        res.status(200).json({
            success: true,
            cleanBackgroundUrl: `/uploads/backgrounds/${templateId}_master_bg.png`,
            zonesProcessed: finalZones.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const captureVectors = async (pdfDoc, templateId) => {
    const pages = pdfDoc.getPages();
    let totalCaptured = 0;

    // Nettoyage préalable pour éviter les doublons si on relance
    await VectorGraphic.deleteMany({ templateId });

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageNumber = i + 1;
        const { width, height } = page.getSize();

        // A. EXTRACTION DU FOND (RECT)
        const background = new VectorGraphic({
            templateId,
            pageNumber,
            type: 'rect',
            svgPath: `M 0 0 H ${width} V ${height} Z`,
            style: {
                fillColor: '#FFFFFF',
                strokeWidth: 0,
                opacity: 1
            },
            position: { x: 0, y: 0, width, height, rotation: 0 },
            zIndex: -1
        });
        await background.save();
        totalCaptured++;

        // B. EXTRACTION DES LOGOS / IMAGES RASTERISÉES
        const resources = page.node.Resources();
        const xObjects = resources?.lookup(PDFName.of('XObject'));

        if (xObjects) {
            const entries = xObjects.entries();
            for (let j = 0; j < entries.length; j++) {
                const [name, ref] = entries[j];
                const xObj = pdfDoc.context.lookup(ref);

                if (xObj instanceof PDFRawStream && xObj.dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
                    const imgW = xObj.dict.get(PDFName.of('Width')).numberValue;
                    const imgH = xObj.dict.get(PDFName.of('Height')).numberValue;

                    const vectorImg = new VectorGraphic({
                        templateId,
                        pageNumber,
                        type: 'image',
                        imageUrl: `obj_${ref.objectNumber}`, // ID pour ton futur loader d'assets
                        position: {
                            x: 20, // Coordonnées par défaut (à raffiner via les matrices de transformation)
                            y: 20,
                            width: imgW * 0.2645, // Conversion px vers mm approximative
                            height: imgH * 0.2645
                        },
                        zIndex: j + 1
                    });
                    await vectorImg.save();
                    totalCaptured++;
                }
            }
        }
    }
    return totalCaptured;
};