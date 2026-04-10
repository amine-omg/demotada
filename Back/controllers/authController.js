// backend/controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { transporter } from '../utils/emailService.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

// 1. Demande de réinitialisation de mot de passe
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; 
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `<h1>Réinitialisation de mot de passe</h1><p>Cliquez ici : <a href="${resetUrl}">${resetUrl}</a></p>`;
    await transporter.sendMail({ to: user.email, subject: 'Réinitialisation de mot de passe', html: message });

    res.status(200).json({ message: "Email envoyé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
};

// 2. Réinitialisation effective
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Token invalide ou expiré" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 3. Inscription
export const register = async (req, res) => {
  try {
    const { nom, prenom, password, role, photo } = req.body;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé.' });

    const newUser = new User({ nom, prenom, email, password, role: role || 'apprenant', photo: photo || '' });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur enregistré', user: { id: newUser._id, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur register' });
  }
};

// 4. Connexion (FIX: Suppression du populate problématique)
export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';

    // On ne fait plus .populate('associatedEntity') ici pour éviter le crash 500
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    try { await ActivityLog.create({ user: user._id, action: 'login' }); } catch (e) {}

    const token = jwt.sign(
      { id: user._id, role: user.role, isOnboarded: user.isOnboarded },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );
    
    res.status(200).json({ 
      token, 
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        photo: user.photo,
        isOnboarded: user.isOnboarded
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

// 5. Déconnexion avec calcul de durée
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const lastLogin = await ActivityLog.findOne({ user: userId, action: 'login' }).sort({ timestamp: -1 });

    if (lastLogin) {
      const duration = Math.round((new Date() - new Date(lastLogin.timestamp)) / 1000);
      await ActivityLog.create({ user: userId, action: 'logout', durationInSeconds: duration });
    }
    res.status(200).json({ message: 'Déconnecté' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
};