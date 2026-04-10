// backend/routes/emailTemplateRoutes.js
import express from 'express';
import { getEmailTemplatesForEcole, updateEmailTemplate, seedDefaultTemplatesForEcole } from '../controllers/emailTemplateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/seed-defaults', protect, authorize('admin'), seedDefaultTemplatesForEcole);

// On protège toutes les routes et on s'assure que seuls les admins et les écoles peuvent y accéder
router.use(protect, authorize('admin', 'ecole'));

// Route pour lister tous les templates d'une école
router.route('/').get(getEmailTemplatesForEcole);

// Route pour mettre à jour un template spécifique par son ID
router.route('/:id').put(updateEmailTemplate);

export default router;