// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// On exporte directement la constante 'protect'
export const protect = async (req, res, next) => {
    let token;

    // Logs de début du middleware
    console.log('PROTECT MIDDLEWARE: Requête reçue pour', req.method, req.originalUrl);
    console.log('PROTECT MIDDLEWARE: Headers Authorization:', req.headers.authorization);

    // Vérifie si l'en-tête d'autorisation est présent et commence par 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrait le token de l'en-tête (format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];
            console.log('PROTECT MIDDLEWARE: Token extrait (premiers 10 chars):', token ? token.substring(0, 10) + '...' : 'Absent');

            // Vérifie si la clé secrète JWT est définie
            if (!process.env.JWT_SECRET) {
                console.error('PROTECT MIDDLEWARE: ERREUR - JWT_SECRET non défini dans les variables d\'environnement !');
                return res.status(500).json({ message: 'Erreur serveur: Clé secrète JWT non configurée.' });
            }

            // Vérifie et décode le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('PROTECT MIDDLEWARE: Token décodé. User ID:', decoded.id, 'Rôle:', decoded.role);

            // Trouve l'utilisateur dans la base de données basé sur l'ID du token
            // .select('-password') exclut le mot de passe du résultat
            req.user = await User.findById(decoded.id).select('-password');

            // Vérifie si un utilisateur correspondant a été trouvé
            if (!req.user) {
                console.error('PROTECT MIDDLEWARE: Utilisateur correspondant au token non trouvé en DB.');
                return res.status(401).json({ message: 'Non autorisé, utilisateur du token non trouvé.' });
            }

            console.log('PROTECT MIDDLEWARE: Utilisateur authentifié:', req.user.email);
            debugger; // <--- POINT D'ARRÊT ICI : Juste avant de passer au contrôleur
            next(); // Passe au prochain middleware ou au gestionnaire de route
        } catch (error) {
            // Gère les erreurs de vérification JWT (token invalide, expiré, etc.)
            console.error('PROTECT MIDDLEWARE: Erreur JWT (token invalide/expiré):', error.message);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Non autorisé, token expiré' });
            } else {
                res.status(401).json({ message: 'Non autorisé, token a échoué' });
            }
        }
    } else {
        console.log('PROTECT MIDDLEWARE: Pas de token Bearer fourni dans les headers Authorization.');
        res.status(401).json({ message: 'Non autorisé, pas de token fourni' });
    }
};

// Nouvelle fonction 'authorize' pour vérifier les rôles
export const authorize = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        console.warn(`AUTHORIZE MIDDLEWARE: Accès refusé pour l'utilisateur ${req.user ? req.user.email : 'inconnu'} avec le rôle ${req.user ? req.user.role : 'N/A'}. Rôles requis: ${roles.join(', ')}`);
        return res.status(403).json({ message: 'Accès non autorisé à cette ressource.' });
    }
    console.log(`AUTHORIZE MIDDLEWARE: Accès autorisé pour l'utilisateur ${req.user.email} (${req.user.role}).`);
    next();
};
