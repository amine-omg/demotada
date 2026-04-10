import express from 'express';
const router = express.Router();
import * as ecoleController from '../controllers/ecoleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// --- AJOUT : Route pour la recherche d'établissements par l'admin ---
// Doit être avant '/me' et '/:id' pour être prioritaire
router.route('/search-list')
    .get(protect, authorize(['admin']), ecoleController.getEcolesListForAdmin);
// --- FIN DE L'AJOUT ---

// --- ROUTE POUR L'UTILISATEUR CONNECTÉ ---
// Doit être avant '/:id' pour être prioritaire
router.route('/me')
    .get(protect, authorize(['admin', 'ecole']), ecoleController.getMesEtablissements);

// --- ROUTES GÉNÉRALES ---
router.route('/')
    .get(protect, ecoleController.getAllEcoles)
    // CORRIGÉ ICI : 'admin' est maintenant dans un tableau
    .post(protect, authorize(['admin', 'ecole']), ecoleController.createEcole);

// --- ROUTE POUR API EXTERNE ---
router.route('/external-formations/:siret')
    .get(protect, authorize(['admin', 'ecole']), ecoleController.getExternalFormationsBySiret);

// --- ROUTES SPÉCIFIQUES À UNE ÉCOLE ---
// Doit être avant '/:id' pour ne pas que "formations" soit interprété comme un ID
router.route('/:id/formations')
    .get(protect, authorize(['admin', 'ecole']), ecoleController.getFormationsForEcole);

// CORRIGÉ ICI : 'admin' est maintenant dans un tableau
router.post('/:id/regenerate-crmid', protect, authorize(['admin']), ecoleController.regenerateCrmId);

// @route   GET /api/ecoles/:id -> Récupère une école par ID
// @route   PUT /api/ecoles/:id -> Met à jour une école
// @route   DELETE /api/ecoles/:id -> Supprime une école
router.route('/:id')
    .get(protect, ecoleController.getEcoleById)
    // CORRIGÉ ICI : 'admin' est maintenant dans un tableau
    .put(protect, authorize(['admin']), ecoleController.updateEcole)
    // CORRIGÉ ICI : 'admin' est maintenant dans un tableau
    .delete(protect, authorize(['admin']), ecoleController.deleteEcole);

export default router;