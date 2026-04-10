import express from 'express';
const router = express.Router();
import * as smsAuthController from '../controllers/smsAuthController.js';

// @route   POST /api/sms-auth/send
// @desc    Génère et envoie un code OTP par SMS au signataire
// @access  Public (Sécurisé par le token de signature dans le body)
router.post('/send', smsAuthController.sendOTP);

// @route   POST /api/sms-auth/verify
// @desc    Vérifie le code saisi par l'utilisateur
// @access  Public
router.post('/verify', smsAuthController.verifyOTP);

export default router;