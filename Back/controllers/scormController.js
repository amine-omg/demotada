// backend/controllers/scormController.js
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { Parser } from 'xml2js';
import Formation from '../models/Formation.js';
import Chapter from '../models/Chapter.js';

export const importScormPackage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier SCORM n'a été envoyé." });
  }

  const zipPath = req.file.path;
  console.log(`[SCORM Import] Début du traitement pour : ${zipPath}`);

  try {
    const outputFolderName = path.basename(zipPath, '.zip');
    const outputFolderPath = path.join('uploads', 'scorm', outputFolderName);
    
    await fs.promises.mkdir(outputFolderPath, { recursive: true });

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: outputFolderPath }));
      stream.on('close', resolve);
      stream.on('error', reject);
    });

    fs.unlink(zipPath, (err) => {
      if (err) console.error("[SCORM Import] Avertissement: n'a pas pu supprimer le .zip original:", err);
      else console.log(`[SCORM Import] Fichier .zip original (${zipPath}) supprimé.`);
    });

    const manifestPath = path.join(outputFolderPath, 'imsmanifest.xml');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('imsmanifest.xml non trouvé à la racine du package.');
    }

    const xmlData = await fs.promises.readFile(manifestPath, 'utf-8');
    const parser = new Parser({ explicitArray: false, ignoreAttrs: false, mergeAttrs: true });
    const manifest = (await parser.parseStringPromise(xmlData)).manifest;

    // --- LOG DE DÉBOGAGE IMPORTANT ---
    console.log('[SCORM Import] Structure du manifeste parsé :', JSON.stringify(manifest, null, 2));


    // 1. Extraire les informations du manifeste
    const organization = manifest.organizations.organization;
    const formationTitle = organization.title || 'Titre de la formation SCORM';
    const scormVersion = manifest.metadata?.schemaversion || '1.2';

    // 2. Créer la formation en base de données avec TOUS les champs par défaut
    const newFormation = new Formation({
      title: formationTitle,
      description: `Formation importée depuis un package SCORM (${req.file.originalname}).`,
      status: 'draft',
      createdBy: req.user._id,
      image: '',
      lessons: 0,
      students: 0,
      sales: 0,
      price: { prix: 0, prixPromotionnel: 0 },
      objectives: 'Objectifs à définir.',
      publicCible: 'Public à définir.',
      videoPresentation: '',
      descriptionCourte: `Description courte pour ${formationTitle}`,
      descriptionLongue: `Description longue pour ${formationTitle}`,
      category: null,
      isContinuousEnrollmentEnabled: false,
      approvedInstructors: [],
      domain: 'Business',
      tags: ['scorm', `scorm-${scormVersion}`],
      validationStatus: 'pending',
    });
    
    console.log(`[SCORM Import] Création de la formation : "${formationTitle}"`);

    // 3. Mapper les items du manifeste aux chapitres et contenus
    const items = Array.isArray(organization.item) ? organization.item : [organization.item];
    const allResources = Array.isArray(manifest.resources.resource) ? manifest.resources.resource : [manifest.resources.resource];

    const chapterPromises = items.map(async (item, index) => {
      const chapterTitle = item.title || `Chapitre ${index + 1}`;
      
      const newChapter = new Chapter({
        title: chapterTitle,
        order: index,
        formation: newFormation._id,
        contents: [],
      });

      const resourceId = item.identifierref;
      const resource = allResources.find(r => r.identifier === resourceId);

      if (resource && resource.href) {
        const entryPoint = path.join(outputFolderPath, resource.href).replace(/\\/g, '/');
        
        newChapter.contents.push({
          type: 'scorm',
          title: item.title,
          order: 0,
          scormEntryPoint: entryPoint,
          scormVersion: scormVersion,
        });
      }
      
      await newChapter.save();
      return newChapter._id;
    });

    const createdChapterIds = await Promise.all(chapterPromises);
    newFormation.chapters = createdChapterIds;

    await newFormation.save();
    console.log('[SCORM Import] Formation et chapitres sauvegardés avec succès !');

    const finalFormation = await Formation.findById(newFormation._id).populate('chapters');

    res.status(201).json(finalFormation);

  } catch (error) {
    console.error("[SCORM Import] CRASH DANS LE BLOC TRY/CATCH :", error);
    if (fs.existsSync(zipPath)) {
      fs.unlink(zipPath, (err) => {
        if (err) console.error("[SCORM Import] Avertissement: n'a pas pu supprimer le .zip d'erreur:", err);
      });
    }
    res.status(500).json({ message: error.message || 'Erreur interne du serveur.' });
  }
};