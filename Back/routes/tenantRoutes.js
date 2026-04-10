import express from 'express';
const router = express.Router();
import * as tenantController from '../controllers/tenantController.js';

// @route   POST /api/tenants
// @desc    Inscription d'un nouveau client SaaS
router.post('/', tenantController.createTenant);

// @route   GET /api/tenants/:slug
// @desc    Récupère les infos publiques (branding/logo) pour l'affichage dynamique
router.get('/:slug', tenantController.getTenantBySlug);

// @route   PATCH /api/tenants/:id
// @desc    Modification des réglages (admin uniquement)
router.patch('/:id', tenantController.updateTenant);

export default router;