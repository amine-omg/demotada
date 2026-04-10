// backend/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { 
  uploadFile, 
  getMyTemplates 
} from '../controllers/uploadController.js';
import Template from '../models/Template.js'; // CORRECT (car export default)

const router = express.Router();

// Configuration de Multer pour le stockage en mémoire (Buffer pour R2)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // On accepte uniquement les PDFs pour le clonage Karnain
  const allowedMimeTypes = ['application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés pour le clonage.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Limite à 50 Mo par fichier
});

/**
 * ROUTES KARNAIN TEMPLATES
 */

// Route principale : Utilisée pour l'upload et le clonage (Magic Clone)
// Correspond à POST /api/upload
router.post(
    '/', 
    protect, 
    upload.single('file'), 
    uploadFile
);

router.get('/list', protect, getMyTemplates); // C'est cette ligne qui sauve ton refresh !

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Suppression dans MongoDB
    const deletedDoc = await Template.findByIdAndDelete(id);
    
    if (!deletedDoc) {
      return res.status(404).json({ message: "Document non trouvé dans la base" });
    }

    // Optionnel : Ici tu devrais aussi supprimer le fichier sur Cloudflare R2
    // si tu veux garder ton stockage propre.

    res.json({ success: true, message: "Document supprimé de MongoDB" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
});

export default router;