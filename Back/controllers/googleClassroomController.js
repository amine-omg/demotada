import { google } from 'googleapis';
import User from '../models/User.js';
import GoogleClassroom from '../models/GoogleClassroom.js';

// --- Configuration de l'OAuth2 Client ---
// Ces variables doivent être dans votre fichier .env
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // ex: 'http://localhost:3000/api/google/callback'
);

// Définir les permissions (scopes) que votre application demande
const scopes = [
  'https://www.googleapis.com/auth/classroom.courses.readonly', // Voir les cours
  'https://www.googleapis.com/auth/classroom.rosters.readonly',  // Voir les listes d'élèves
  'https://www.googleapis.com/auth/userinfo.profile',           // Voir les infos de base du profil
  'https://www.googleapis.com/auth/userinfo.email',              // Voir l'email
];

// @desc    1. Lance le processus d'authentification OAuth2 avec Google
// @route   GET /api/google/auth
export const initiateAuth = (req, res) => {
  // Génère l'URL de consentement de Google
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important pour obtenir un refresh_token
    scope: scopes,
    // On peut passer l'ID de l'utilisateur Syali pour le retrouver au retour
    state: req.user.id
  });
  // Redirige l'utilisateur vers cette URL
  res.redirect(authUrl);
};

// @desc    2. Gère la redirection de Google après l'authentification
// @route   GET /api/google/callback
export const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // On récupère l'ID de notre utilisateur

    // Échange le code d'autorisation contre des tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date, id_token } = tokens;

    // On peut vérifier l'id_token pour récupérer l'ID Google de l'utilisateur
    const ticket = await oauth2Client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googleId = ticket.getPayload().sub;

    // Sauvegarder les tokens dans la base de données pour l'utilisateur
    await User.findByIdAndUpdate(userId, {
      'googleAuth.googleId': googleId,
      'googleAuth.accessToken': access_token,
      'googleAuth.refreshToken': refresh_token, // Le refresh_token n'est donné que la première fois
      'googleAuth.tokenExpiresAt': new Date(expiry_date),
    }, { new: true });

    // Rediriger l'utilisateur vers la page des salles de classe dans le frontend
    res.redirect('http://localhost:5173/salles'); // Adaptez l'URL de votre frontend

  } catch (error) {
    console.error("Erreur lors du callback Google:", error);
    res.status(500).redirect('/error-page'); // Rediriger vers une page d'erreur
  }
};

// @desc    3. Récupère la liste des classes Classroom de l'utilisateur
// @route   GET /api/google/classes
export const getUserClasses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.googleAuth || !user.googleAuth.accessToken) {
            return res.status(401).json({ message: "L'utilisateur n'est pas connecté à Google." });
        }

        // Configurer le client OAuth2 avec les tokens de l'utilisateur
        oauth2Client.setCredentials({
            access_token: user.googleAuth.accessToken,
            refresh_token: user.googleAuth.refreshToken,
        });

        const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

        const response = await classroom.courses.list({
            teacherId: 'me', // Récupère les cours où l'utilisateur est enseignant
            courseStates: ['ACTIVE']
        });

        res.status(200).json(response.data.courses || []);

    } catch (error) {
        console.error("Erreur lors de la récupération des classes Google:", error);
        res.status(500).json({ message: "Impossible de récupérer les classes." });
    }
};


// @desc    4. Synchronise une classe Google avec Syali
// @route   POST /api/google/classes/sync
export const syncClass = async (req, res) => {
    const { g_classroomId, name, section, g_ownerId } = req.body;
    const syaliFormateurId = req.user.id;

    try {
        // Vérifier si la classe n'est pas déjà synchronisée
        const existingClass = await GoogleClassroom.findOne({ g_classroomId });
        if (existingClass) {
            return res.status(409).json({ message: 'Cette classe est déjà synchronisée.' });
        }

        const newSyncedClass = new GoogleClassroom({
            g_classroomId,
            name,
            section,
            g_ownerId,
            syaliFormateurId
        });

        await newSyncedClass.save();

        res.status(201).json({ message: 'Classe synchronisée avec succès.', class: newSyncedClass });

    } catch (error) {
        console.error("Erreur lors de la synchronisation de la classe:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
