import express from 'express';
const router = express.Router();
import * as reminderController from '../controllers/reminderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// @route   POST /api/reminders
// @desc    Programmer une relance automatique
router.post('/', protect, reminderController.createReminder);

// @route   GET /api/reminders/tenant/:tenantId
// @desc    Voir toutes les relances en cours pour un client
router.get('/tenant/:tenantId', protect, reminderController.getActiveRemindersByTenant);

// @route   PATCH /api/reminders/:id/stop
// @desc    Arrêter manuellement une relance
router.patch('/:id/stop', protect, reminderController.stopReminder);

export default router;