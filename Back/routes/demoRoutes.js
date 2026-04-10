import express from 'express';
import multer from 'multer';
import { analyzeQuoteAndCreateDossier, getDossiers, getDossierById, extractAHData, generateAHPdf, updateDossierStatus, getLotsEmmy, getLotEmmyById, updateLotEmmyStatus, createLotEmmy, uploadRaiDocument,
getEntreprises, createEntreprise, getEntrepriseById, updateEntreprise, getTarifs, updateTarif, createDossier } from '../controllers/demoController.js';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-quote', upload.single('file'), analyzeQuoteAndCreateDossier);
router.get('/dossiers', getDossiers);
router.get('/dossiers/:id', getDossierById);
router.put('/dossiers/:id/status', updateDossierStatus);
router.post('/extract-ah', upload.single('file'), extractAHData);
router.post('/generate-ah-pdf', generateAHPdf);

router.get('/lots', getLotsEmmy);
router.get('/lots/:id', getLotEmmyById);
router.put('/lots/:id/status', updateLotEmmyStatus);
router.post('/lots', createLotEmmy);

router.post('/dossiers/:id/upload-rai', upload.single('file'), uploadRaiDocument);

router.get('/entreprises', getEntreprises);
router.post('/entreprises', createEntreprise);
router.get('/entreprises/:id', getEntrepriseById);

router.put('/entreprises/:id', updateEntreprise);

router.get('/tarifs', getTarifs);
router.put('/tarifs/:id', updateTarif);

router.post('/dossiers', createDossier);

export default router;