// backend/controllers/uploadController.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { Agent } from 'https';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import Template from '../models/Template.js';
import fs from 'fs';      
import path from 'path';  
import { pdf } from 'pdf-to-img'; // 👈 IMPORT IMPORTANT ICI

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

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier fourni.' });
  }

  try {
    const fileExtension = req.file.originalname.split('.').pop();
    const fileKey = `content/${nanoid()}.${fileExtension}`;

    // 1. Upload vers Cloudflare R2
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;
    const organizationId = req.user?.organizationId || req.user?._id;

    if (!organizationId) {
      return res.status(401).json({ message: "Authentification requise pour créer un template." });
    }

    // 2. Persistance dans MongoDB
    const newTemplate = await Template.create({
      name: req.file.originalname,
      backgroundUrl: publicUrl, 
      organizationId: organizationId,
      progress: {
        upload: 'complete',
        layout: 'none',
        vectors: 'none',
        ocr: 'none', 
        logic: 'none'
      },
      metadata: {
        originalFileName: req.file.originalname,
        pageCount: 1
      },
      status: 'active'
    });

    // 3. SAUVEGARDES LOCALES (PDF + IMAGE)
    try {
      // 3.A : Sauvegarde du PDF
      const localPdfDir = path.join(process.cwd(), 'uploads', 'pdf');
      if (!fs.existsSync(localPdfDir)) fs.mkdirSync(localPdfDir, { recursive: true });
      const localPdfPath = path.join(localPdfDir, `${newTemplate._id}.pdf`);
      fs.writeFileSync(localPdfPath, req.file.buffer);
      
      // 3.B : CRÉATION INSTANTANÉE DE L'IMAGE (Le fameux déménagement !)
      const bgDir = path.join(process.cwd(), 'uploads', 'backgrounds');
      if (!fs.existsSync(bgDir)) fs.mkdirSync(bgDir, { recursive: true });
      const backgroundPath = path.join(bgDir, `${newTemplate._id}_p1.png`);
      
      const document = await pdf(req.file.buffer, { scale: 2.0 });
      for await (const page of document) {
          fs.writeFileSync(backgroundPath, page);
          break; // On coupe direct après la page 1
      }
      console.log(`🖼️ Miniature générée avec succès dès l'upload : ${backgroundPath}`);

    } catch (localErr) {
      console.error("⚠️ Impossible de sauvegarder en local:", localErr.message);
    }

    // 4. Réponse
    res.status(201).json({ 
      success: true,
      url: publicUrl, 
      documentId: newTemplate._id, 
      name: newTemplate.name,
      message: "Upload et génération de la miniature réussis"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur", error: error.message });
  }
};

export const getMyTemplates = async (req, res) => {
  try {
    const templates = await Template.find({}).sort({ createdAt: -1 });
    const formattedTemplates = templates.map(t => ({
      id: t._id,
      name: t.name,
      url: t.backgroundUrl,
      progress: t.progress || { upload: 'complete', layout: 'none', vectors: 'none', ocr: 'none', logic: 'none' }
    }));
    res.json(formattedTemplates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};