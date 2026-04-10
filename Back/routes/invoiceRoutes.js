import express from 'express';
const router = express.Router();
import * as invoiceController from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   GET /api/invoices/config/:templateId
// @desc    Récupère les règles de calcul (TVA, devises)
router.get('/config/:templateId', protect, invoiceController.getInvoiceMetadata);

// @route   POST /api/invoices/config
// @desc    Définit comment le moteur doit traiter les chiffres
router.post('/config', protect, authorize(['admin', 'accountant']), invoiceController.upsertInvoiceMetadata);

export default router;