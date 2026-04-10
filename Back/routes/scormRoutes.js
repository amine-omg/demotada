// backend/routes/scormRoutes.js
import express from 'express';
import multer from 'multer';
import { importScormPackage } from '../controllers/scormController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assumant une protection

const router = express.Router();

// Configuration de Multer pour stocker les fichiers dans le dossier 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Le dossier où les fichiers seront sauvegardés
  },
  filename: function (req, file, cb) {
    // Garde le nom original mais y ajoute un timestamp pour éviter les conflits
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.zip');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // On n'accepte que les fichiers .zip
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non valide. Seuls les .zip sont autorisés.'), false);
    }
  }
});

// Définition de la route POST pour l'import
// La protection est importante pour que seuls les utilisateurs autorisés puissent uploader.
// 'scormfile' est le nom du champ attendu dans le formulaire d'upload.
router.post('/import', protect, upload.single('scormfile'), importScormPackage);

export default router;