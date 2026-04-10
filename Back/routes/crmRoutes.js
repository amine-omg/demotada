// backend/routes/crmRoutes.js
import express from 'express';
import Opportunite from '../models/Opportunite.js';
import CrmConfig from '../models/CrmConfig.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

import {
    getCrmConfig,
    updateCrmConfig,
    getOpportunites,
    createOpportunite,
    getOpportuniteById,
    updateOpportunite,
    deleteOpportunite,
    addApprenantToOpportunite,
    createProspectForOpportunite
} from '../controllers/crmController.js'; 

const router = express.Router();

router.use(protect, authorize(['admin', 'ecole']));

router.route('/config')
    .get(getCrmConfig)
    .put(updateCrmConfig);

router.route('/opportunites')
    .get(getOpportunites)
    .post(createOpportunite);

router.route('/opportunites/:id')
    .get(getOpportuniteById)
    .put(updateOpportunite)
    .delete(deleteOpportunite);

router.post('/opportunites/:id/apprenants', addApprenantToOpportunite); 
router.post('/opportunites/:id/prospects', createProspectForOpportunite);

export default router;