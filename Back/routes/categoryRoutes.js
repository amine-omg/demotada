import express from 'express';
const router = express.Router();
import * as categoryController from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// --- ROUTES PUBLIQUES / CONSULTATION ---

// @route   GET /api/categories
// @desc    Lister les catégories (filtrées par tenant/école via query params)
router.get('/', protect, categoryController.getCategories);

// @route   GET /api/categories/:id
// @desc    Récupérer les détails d'une catégorie (avec ses formations liées)
router.get('/:id', protect, categoryController.getCategoryById);


// --- ROUTES ADMINISTRATIVES (Admin, Instructor, Owner) ---

// @route   POST /api/categories
// @desc    Créer une nouvelle catégorie (Whitelabel ou Formation)
router.post(
    '/', 
    protect, 
    authorize(['admin', 'instructor', 'owner', 'ecole']), 
    categoryController.createCategory
);

// @route   PUT /api/categories/:id
// @desc    Modifier une catégorie existante
router.put(
    '/:id', 
    protect, 
    authorize(['admin', 'instructor', 'owner', 'ecole']), 
    categoryController.updateCategory
);

// @route   DELETE /api/categories/:id
// @desc    Supprimer une catégorie et délier les formations associées
router.delete(
    '/:id', 
    protect, 
    authorize(['admin', 'owner']), 
    categoryController.deleteCategory
);

export default router;