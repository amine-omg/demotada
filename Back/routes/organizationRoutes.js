import express from 'express';
const router = express.Router();
import * as organizationController from '../controllers/organizationController.js';

// @route   GET /api/organizations/:tenantId
// @desc    Récupère les infos légales pour un client donné
router.get('/:tenantId', organizationController.getOrganizationByTenant);

// @route   POST /api/organizations
// @desc    Enregistre les infos (Nom légal, SIRET, etc.)
router.post('/', organizationController.upsertOrganization);

export default router;