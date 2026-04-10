// backend/routes/authRoutes.js
import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import dotenv from 'dotenv';
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

router.post('/google', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'ID Token manquant.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                nom: name.split(' ').pop() || '',
                prenom: name.split(' ').slice(0, -1).join(' ') || name,
                email,
                password: Math.random().toString(36).slice(-8), 
                role: 'apprenant', 
                photo: picture,
                isOnboarded: false,
            });
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, isOnboarded: user.isOnboarded },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Connexion Google réussie',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                photo: user.photo,
                isOnboarded: user.isOnboarded, 
            }
        });

    } catch (error) {
        console.error('Erreur lors de la vérification du token Google :', error);
        res.status(401).json({ message: 'Token Google invalide ou expiré.' });
    }
});

export default router;
