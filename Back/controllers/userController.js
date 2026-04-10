// backend/controllers/userController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Ecole from '../models/Ecole.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

// --- CONFIGURATION CLOUDFLARE R2 ---
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Helper pour formater la réponse utilisateur standard
const formatUserResponse = (user) => {
    const u = user.toObject ? user.toObject() : user;
    delete u.password;
    return {
        _id: u._id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: u.telephone || '',
        role: u.role,
        photo: u.photo || '',
        competences: u.competences || [],
        isOnboarded: u.isOnboarded,
        associatedEntity: u.associatedEntity || null,
        isHandicap: u.isHandicap || false
    };
};

// --- RÉCUPÉRATION DE PROFIL ---
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('associatedEntity');
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        res.json(formatUserResponse(user));
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};

export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email }).select('_id nom prenom email');
        if (!user) return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur recherche utilisateur", error: error.message });
    }
};

export const getUserFormations = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        
        const [created, approved] = await Promise.all([
            Formation.find({ createdBy: userId }).select('_id title').lean(),
            Formation.find({ approvedInstructors: userId }).select('_id title').lean()
        ]);

        const allFormations = [...created, ...approved];
        const uniqueFormations = Array.from(new Map(allFormations.map(f => [f._id.toString(), f])).values());

        res.status(200).json(uniqueFormations);
    } catch (error) {
        res.status(500).json({ message: "Erreur formations", error: error.message });
    }
};

// --- MISES À JOUR ---
export const updateUserProfile = async (req, res) => {
    try {
        const { nom, prenom, photo, competences, telephone } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

        if (nom !== undefined) user.nom = nom;
        if (prenom !== undefined) user.prenom = prenom;
        if (photo !== undefined) user.photo = photo;
        if (competences !== undefined) user.competences = competences;
        if (telephone !== undefined) user.telephone = telephone;
        user.modifiedAt = Date.now();

        await user.save();
        res.status(200).json(formatUserResponse(user));
    } catch (error) {
        res.status(500).json({ message: 'Erreur mise à jour profil.', error: error.message });
    }
};

export const onboardUserProfile = async (req, res) => {
    try {
        const { role, customData } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

        user.role = role;
        user.competences = customData?.competences || [];
        user.isOnboarded = true;
        await user.save();

        const newToken = jwt.sign(
            { id: user._id, role: user.role, isOnboarded: user.isOnboarded },
            process.env.JWT_SECRET,
            { expiresIn: '30d' } // Augmenté pour éviter les déconnexions intempestives
        );

        res.status(200).json({
            message: 'Profil onboardé avec succès',
            token: newToken,
            user: formatUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur onboarding.', error: error.message });
    }
};

// --- GESTION ADMINISTRATIVE (Admin) ---
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('associatedEntity');
        user ? res.json(user) : res.status(404).json({ message: 'Utilisateur non trouvé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        user.nom = req.body.nom || user.nom;
        user.prenom = req.body.prenom || user.prenom;
        user.email = req.body.email || user.email;
        user.telephone = req.body.telephone || user.telephone;
        user.role = req.body.role || user.role;
        user.isHandicap = req.body.isHandicap !== undefined ? req.body.isHandicap : user.isHandicap;

        await user.save();
        res.json(formatUserResponse(user));
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        await user.deleteOne();
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// --- SÉCURITÉ COMPTE ---
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: "Le mot de passe actuel est incorrect." });

        if (newPassword.length < 8) return res.status(400).json({ message: "Minimum 8 caractères requis." });

        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "Mot de passe mis à jour !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur changement mot de passe." });
    }
};

// --- GESTION DES PHOTOS (R2 STORAGE) ---
const handlePhotoUpload = async (user, file) => {
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `avatars/${user._id}-${nanoid()}.${fileExtension}`;
    
    const uploadCommand = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: newFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3Client.send(uploadCommand);
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${newFileName}`;
};

export const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier.' });
        const user = await User.findById(req.user.id);
        
        user.photo = await handlePhotoUpload(user, req.file);
        await user.save();
        
        res.status(200).json({ message: 'Photo mise à jour.', user: formatUserResponse(user) });
    } catch (error) {
        res.status(500).json({ message: "Erreur upload." });
    }
};

export const updateUserPhotoByAdmin = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier.' });
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

        user.photo = await handlePhotoUpload(user, req.file);
        await user.save();
        
        res.status(200).json({ message: "Photo mise à jour par l'admin", user: formatUserResponse(user) });
    } catch (error) {
        res.status(500).json({ message: "Erreur upload admin." });
    }
};