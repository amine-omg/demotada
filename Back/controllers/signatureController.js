import crypto from 'crypto';
import { PDFDocument } from 'pdf-lib';
import SignatureRequest from '../models/SignatureRequest.js';
import Opportunite from '../models/Opportunite.js';
import { sendSignatureRequestEmail, sendSignedDocumentEmail } from '../utils/emailService.js';

export const createSignatureRequest = async (req, res) => {
    try {
        const { opportuniteId, activityId, documentType, recipientEmail, customMessage } = req.body;
        const token = crypto.randomBytes(32).toString('hex');

        const newRequest = new SignatureRequest({
            opportunite: opportuniteId,
            activityId,
            documentType,
            token
        });

        await newRequest.save();
        const signUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sign/${token}`;

        await sendSignatureRequestEmail(
            recipientEmail,
            documentType === 'Devis' ? 'Devis Commercial' : 'Convention de formation',
            signUrl,
            customMessage
        );

        await Opportunite.updateOne(
            { _id: opportuniteId, "activites._id": activityId },
            { $set: { "activites.$.status": "pending_signature" } }
        );

        res.status(201).json({ message: "Demande envoyée avec succès", token });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'envoi." });
    }
};

export const getSignatureDetails = async (req, res) => {
    try {
        const { token } = req.params;
        const request = await SignatureRequest.findOne({ token }).populate('opportunite');
        if (!request || request.status === 'signed') {
            return res.status(404).json({ message: "Lien invalide ou déjà signé." });
        }
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

export const finalizeSignature = async (req, res) => {
    try {
        const { token } = req.params;
        const { signatureImage, pdfBase64 } = req.body;

        const request = await SignatureRequest.findOne({ token }).populate('opportunite');
        if (!request) return res.status(404).json({ message: "Requête introuvable." });

        const pdfDoc = await PDFDocument.load(pdfBase64);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        const signatureImg = await pdfDoc.embedPng(signatureImage);
        
        // Coordonnées pour tamponner la signature
        lastPage.drawImage(signatureImg, { x: 130, y: 45, width: 50, height: 25 });

        const signedPdfBase64 = await pdfDoc.saveAsBase64();
        const finalPdfDataUri = `data:application/pdf;base64,${signedPdfBase64}`;

        request.status = 'signed';
        request.signedAt = new Date();
        request.signedFileUrl = finalPdfDataUri;
        await request.save();

        await Opportunite.updateOne(
            { _id: request.opportunite._id, "activites._id": request.activityId },
            { 
                $set: { 
                    "activites.$.status": "signed",
                    "activites.$.content": `Document ${request.documentType} signé le ${new Date().toLocaleDateString()}`
                } 
            }
        );

const recipientEmail = request.opportunite.apprenants?.[0]?.email || request.opportunite.prospects?.[0]?.email;
console.log("Email destinataire trouvé :", recipientEmail);
        if (recipientEmail) {
            await sendSignedDocumentEmail(
                recipientEmail, 
                request.documentType === 'Devis' ? 'Devis Commercial' : 'Convention de formation',
                finalPdfDataUri
            );
        }

        res.status(200).json({ message: "Document signé et e-mail envoyé." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la signature." });
    }
};