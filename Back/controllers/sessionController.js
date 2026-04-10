// backend/controllers/sessionController.js
import axios from 'axios';
import jwt from 'jsonwebtoken';
import Session from '../models/Session.js';
import User from '../models/User.js'; // Pour récupérer les noms/prénoms des utilisateurs
import Formation from '../models/Formation.js'; // Pour vérifier l'existence de la formation
import asyncHandler from 'express-async-handler';

import ProgressionEleve from '../models/ProgressionEleve.js';

import { generateCoursForSession } from './coursController.js';

// Fonction utilitaire pour peupler les données des utilisateurs dans une session
const populateSessionUsers = async (session) => {
    if (!session) return session;

    const populatedSession = session.toObject ? session.toObject() : session;

    const populateUsersList = async (usersList) => {
        if (!usersList || usersList.length === 0) return [];
        const userIds = usersList.map(u => u.userId);
        const usersDetails = await User.find({ _id: { $in: userIds } }).select('nom prenom email photo hasDisability').lean();

        return usersList.map(su => {
            const userDetail = usersDetails.find(ud => ud._id.equals(su.userId));
            return {
                ...su,
                nom: userDetail ? userDetail.nom : su.nom,
                prenom: userDetail ? userDetail.prenom : su.prenom,
                email: userDetail ? userDetail.email : su.email,
                photo: userDetail ? userDetail.photo : undefined,
                hasDisability: userDetail ? userDetail.hasDisability : false,
            };
        });
    };

    populatedSession.formateurs = await populateUsersList(populatedSession.formateurs);
    populatedSession.elevesInscrits = await populateUsersList(populatedSession.elevesInscrits);

    return populatedSession;
};


// backend/controllers/sessionController.js

const generatePermanentZoomMeeting = async (sessionTitle) => {
    
    // Étape 1 : Obtenir le token d'accès (cette partie est correcte)
    const getZoomAccessToken = async () => {
        try {
            const response = await axios.post(
              'https://zoom.us/oauth/token', null,
              {
                params: {
                  grant_type: 'account_credentials',
                  account_id: process.env.ZOOM_ACCOUNT_ID,
                },
                headers: {
                  'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
                },
              }
            );
            return response.data.access_token;
        } catch (error) {
            console.error("Erreur obtention token Zoom:", error.response?.data);
            throw new Error("Impossible d'obtenir le token d'accès Zoom.");
        }
    };

    try {
        const accessToken = await getZoomAccessToken();

        // Étape 2 : Créer la réunion
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', 
            {
                topic: `Session Syali : ${sessionTitle}`,
                type: 8, // Réunion récurrente sans heure fixe
                settings: {
                    join_before_host: true,
                    mute_upon_entry: true,
                    participant_video: true,
                    host_video: true,
                },
                recurrence: {
                    type: 1 // 1 = Récurrence journalière, mais sans date de fin pour le type 8, cela signifie "n'importe quand"
                }
            }, 
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        console.log("[ZOOM] Réunion de session permanente créée.");
        return response.data.join_url;

    } catch (error) {
        console.error("Erreur création réunion Zoom permanente:", error.response?.data);
        return null;
    }
};

export const createSession = async (req, res) => {
    try {
        const { formation, type, title, description, dateDebut, dateFin, dateExamen, lieu, formateurs } = req.body;
        const createdBy = req.user.id;

        // --- Nettoyage des données ---
        if (!lieu || lieu === 'null' || lieu === '') { 
            req.body.lieu = null; 
        }
        if (!formation || !type) { 
            return res.status(400).json({ message: "L'ID de la formation et le type de session sont requis." }); 
        }

        // 1. On prépare la nouvelle session en mémoire
        const newSession = new Session({
            formation, type, title: title || 'Nouvelle Session',
            description, dateDebut, dateFin, dateExamen, 
            lieu: req.body.lieu,
            formateurs: formateurs || [],
            createdBy
        });

        // 2. On tente de générer le lien Zoom
        console.log("Tentative de création d'un lien Zoom permanent...");
        const zoomLink = await generatePermanentZoomMeeting(newSession.title);
        if (zoomLink) {
            newSession.lienZoomUnique = zoomLink;
        } else {
            console.warn("AVERTISSEMENT : La session va être créée sans lien Zoom suite à une erreur de l'API Zoom.");
        }
        
        // 3. On génère l'agenda des cours journaliers (pour l'information)
        if (newSession.type === 'programme') {
            const generatedCours = await generateCoursForSession(newSession, createdBy);
            newSession.cours = generatedCours.map(c => c._id);
        }
       
        // 4. ON SAUVEGARDE UNE SEULE FOIS, à la toute fin.
        const savedSession = await newSession.save();
        
        // 5. On peuple les données utilisateur et on envoie la réponse finale
        const populatedSession = await populateSessionUsers(savedSession);
        res.status(201).json(populatedSession);

    } catch (error) {
        console.error("Erreur dans createSession:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const generateZoomLinkForSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: "Session non trouvée." });
        }

        // On vérifie si un lien n'existe pas déjà pour éviter de l'écraser
        if (session.lienZoomUnique) {
            return res.status(400).json({ message: "Un lien Zoom existe déjà pour cette session." });
        }

        const zoomLink = await generatePermanentZoomMeeting(session.title);
        if (!zoomLink) {
            // Si l'API Zoom échoue, on renvoie une erreur claire
            throw new Error("L'API Zoom n'a pas pu générer de lien.");
        }

        session.lienZoomUnique = zoomLink;
        const savedSession = await session.save();
        
        const populatedSession = await populateSessionUsers(savedSession);
        res.status(200).json(populatedSession);

    } catch (error) {
        console.error("Erreur dans generateZoomLinkForSession:", error);
        res.status(500).json({ message: "Erreur serveur lors de la génération du lien Zoom.", error: error.message });
    }
};

 export const getLiveSessionDetails = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id).select('lienZoomUnique title');

        if (!session) {
            return res.status(404).json({ message: "Session non trouvée." });
        }

        if (!session.lienZoomUnique) {
            return res.status(400).json({ message: "Aucun lien de réunion live n'est configuré pour cette session." });
        }

        // On renvoie les informations nécessaires au frontend
        res.status(200).json({
            lienZoom: session.lienZoomUnique,
            titre: session.title
        });

    } catch (error) {
        console.error("Erreur dans getLiveSessionDetails:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getSessionsForFormation = async (req, res) => {
    try {
        const { formationId } = req.params;
        if (!formationId) {
            return res.status(400).json({ message: "L'ID de la formation est requis." });
        }
        const sessions = await Session.find({ formation: formationId })
            .populate('formation', 'title image')
            .sort({ dateDebut: 1, type: 1 });
        const populatedSessions = await Promise.all(sessions.map(s => populateSessionUsers(s)));
        res.status(200).json(populatedSessions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des sessions", error: error.message });
    }
};

export const getSessionById = async (req, res) => {
    try {
        // AJOUT DE 'evaluations' ICI POUR QU'ELLES SOIENT ENVOYÉES AU FRONT
        const session = await Session.findById(req.params.id)
            .populate('formation', 'title image chapters evaluations'); 
        
        if (!session) {
            return res.status(404).json({ message: "Session non trouvée" });
        }
        const populatedSession = await populateSessionUsers(session);
        res.status(200).json(populatedSession);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const createdBy = req.user.id;

        // 1. Mise à jour initiale (Titre, description, etc.)
        // { new: true } est crucial pour que updatedSession contienne les nouvelles valeurs
        let updatedSession = await Session.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedSession) { 
            return res.status(404).json({ message: "Session non trouvée" }); 
        }

        // 2. Gestion de la logique spécifique aux dates (Régression évitée)
        if (updatedSession.type === 'programme' && (updateData.dateDebut || updateData.dateFin)) {
            const generatedCours = await generateCoursForSession(updatedSession, createdBy);
            
            // Mise à jour de la session avec les nouveaux cours
            updatedSession = await Session.findByIdAndUpdate(
                updatedSession._id,
                { $set: { cours: generatedCours.map(c => c._id) } },
                { new: true }
            );
        }

        // 3. Peuplement des données (Formateurs/Élèves) avant envoi au front
        const populatedSession = await populateSessionUsers(updatedSession);

        // 4. Envoi de la session PROPRE et MISE À JOUR au front
        res.status(200).json(populatedSession);

    } catch (error) {
        res.status(400).json({ 
            message: "Erreur lors de la mise à jour de la session", 
            error: error.message 
        });
    }
};
 
export const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: "Session non trouvée" });
        }
        await session.deleteOne();
        res.status(200).json({ message: "Session supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const getDefaultContinuousSessionForFormation = async (req, res) => {
    try {
        const { formationId } = req.params;
        if (!formationId) {
            return res.status(400).json({ message: "L'ID de la formation est requis." });
        }
        const session = await Session.findOne({ formation: formationId, type: 'continue', isDefaultContinuous: true });
        if (!session) {
            return res.status(200).json(null);
        }
        const populatedSession = await populateSessionUsers(session);
        res.status(200).json(populatedSession);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la session continue par défaut", error: error.message });
    }
};


export const getAllUserProgrammedSessions = async (req, res) => {
    try {
        const userId = req.query.userId || req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "L'ID utilisateur est requis." });
        }
        const userFormations = await Formation.find({
            $or: [
                { createdBy: userId },
                { approvedInstructors: userId }
            ]
        }).select('_id');
        const formationIds = userFormations.map(f => f._id);
        const sessions = await Session.find({
            formation: { $in: formationIds },
            type: 'programme'
        })
        .populate('formation', 'title image')
        .sort({ dateDebut: 1 });
        const populatedSessions = await Promise.all(sessions.map(s => populateSessionUsers(s)));
        res.status(200).json(populatedSessions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de toutes les sessions de l'utilisateur", error: error.message });
    }
};

// REMPLACEZ l'ancienne fonction getAllUserProgrammedSessions par celle-ci
export const getSessions = async (req, res) => {
    try {
        const { ecoleId, intervenantId, formationId, categoryId, lieu } = req.query;
        const userRole = req.user.role;
        const userId = req.user.id;

        const filter = {};

        // La nouvelle logique correcte basée sur les rôles
        if (userRole === 'admin' || userRole === 'ecole') {
            if (ecoleId) {
                // Pour un admin/école, si un contexte est sélectionné, on filtre par l'école
                const formationsInEcole = await Formation.find({ ecole: ecoleId }).select('_id');
                const formationIds = formationsInEcole.map(f => f._id);
                filter.formation = { $in: formationIds };
            }
        } else if (userRole === 'formateur') {
            // Un formateur voit les sessions où il intervient
            filter['formateurs.userId'] = intervenantId || userId;
        }

        // On ajoute les filtres de la barre de recherche s'ils existent
        if (formationId) filter.formation = formationId;
        if (lieu) filter.lieu = lieu;
        if (categoryId) {
            const formationsInCategory = await Formation.find({ category: categoryId }).select('_id');
            const formationIds = formationsInCategory.map(f => f._id);
            // On combine avec le filtre de formation existant si besoin
            filter.formation = filter.formation ? { ...filter.formation, $in: [...filter.formation.$in, ...formationIds] } : { $in: formationIds };
        }

        const sessions = await Session.find(filter)
            .populate('formation', 'title image')
            .populate('formateurs.userId', 'nom prenom')
            .sort({ dateDebut: -1 });

        // Calcule et ajoute le statut pour chaque session
        const sessionsWithStatus = sessions.map(session => {
            const sessionObject = session.toObject();
            return { ...sessionObject, status: session.status };
        });

        const populatedSessions = await Promise.all(sessionsWithStatus.map(s => populateSessionUsers(s)));
        res.status(200).json(populatedSessions);

    } catch (error) {
        console.error("Erreur dans getSessions:", error);
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};


const initializeProgressionForStudents = async (studentIds, session) => {
    // On récupère la formation et on sélectionne son champ 'modules'
    const formation = await Formation.findById(session.formation).select('modules').lean();
    const moduleIds = formation ? formation.modules : [];

    if (!moduleIds || moduleIds.length === 0) {
        console.warn(`[INIT PROGRESSION] Pas de modules trouvés pour la formation. Aucune progression initialisée.`);
        return;
    }

    const bulkOps = [];
    for (const studentId of studentIds) {
        // Opération pour le PREMIER module : on force le statut 'en_cours'
        const firstModuleId = moduleIds[0];
        bulkOps.push({
            updateOne: {
                filter: { user: studentId, session: session._id, contentId: firstModuleId },
                update: { 
                    $set: { status: 'en_cours', startedAt: new Date() },
                    $setOnInsert: {
                        user: studentId, session: session._id,
                        contentId: firstModuleId, contentType: 'Module',
                    }
                },
                upsert: true
            }
        });

        // Opération pour les AUTRES modules : on les crée avec 'bloque' s'ils n'existent pas
        for (let i = 1; i < moduleIds.length; i++) {
            const moduleId = moduleIds[i];
            bulkOps.push({
                updateOne: {
                    filter: { user: studentId, session: session._id, contentId: moduleId },
                    update: {
                        $setOnInsert: {
                            user: studentId, session: session._id,
                            contentId: moduleId, contentType: 'Module', status: 'bloque',
                        }
                    },
                    upsert: true
                }
            });
        }
    }

    if (bulkOps.length > 0) {
        await ProgressionEleve.bulkWrite(bulkOps);
        console.log(`[INIT PROGRESSION] Parcours basé sur les modules initialisé/vérifié pour ${studentIds.length} élève(s).`);
    }
};

export const getContinuousSessionStudentsForFormation = async (req, res) => {
    try {
        const { formationId } = req.params;
        if (!formationId) {
            return res.status(400).json({ message: "L'ID de la formation est requis." });
        }
        const defaultContinuousSession = await Session.findOne({ formation: formationId, type: 'continue', isDefaultContinuous: true });
        if (!defaultContinuousSession) {
            return res.status(200).json([]);
        }
        const populatedStudents = await populateSessionUsers(defaultContinuousSession);
        res.status(200).json(populatedStudents.elevesInscrits || []);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des élèves de la session continue", error: error.message });
    }
};

export const generateZoomSignature = async (req, res) => {
    try {
        // Assurez-vous d'importer 'jwt' en haut du fichier si ce n'est pas déjà fait
        // import jwt from 'jsonwebtoken';
        const SDK_KEY = process.env.ZOOM_SDK_KEY;
        const SDK_SECRET = process.env.ZOOM_SDK_SECRET;

        if (!SDK_KEY || !SDK_SECRET) {
            return res.status(500).json({ message: "Clés SDK manquantes." });
        }

        const iat = Math.floor(Date.now() / 1000) - 30;
        const exp = iat + 60 * 60 * 2;
        const { meetingNumber, role } = req.body;

        const payload = {
            appKey: SDK_KEY, sdkKey: SDK_KEY, mn: meetingNumber, role: role,
            iat: iat, exp: exp, tokenExp: exp
        };

        const signature = jwt.sign(payload, SDK_SECRET, { algorithm: 'HS256', header: { alg: 'HS256', typ: 'JWT' } });
        
        res.json({ signature: signature });

    } catch (error) {
        console.error("Erreur génération signature SDK:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

export const getApprenantSessions = async (req, res) => {
    try {
        const apprenantId = req.user.id; // L'ID de l'apprenant est tiré du token JWT

        if (!apprenantId) {
            return res.status(400).json({ message: "L'ID de l'apprenant est requis." });
        }

        // Trouver les sessions où l'apprenant est dans le tableau elevesInscrits
        const sessions = await Session.find({
            'elevesInscrits.userId': apprenantId // Recherche dans le sous-document
        })
        .populate('formation', 'title image category') // Peupler l'information de la formation
        .sort({ dateDebut: 1, title: 1 }); // Trier chronologiquement

        // Peupler les utilisateurs (formateurs, élèves) pour obtenir leurs détails complets si nécessaire
        // Ici, on mappe pour s'assurer que les statuts virtuels sont calculés.
        const populatedSessions = await Promise.all(sessions.map(s => {
            const sessionObject = s.toObject(); // Convertir en POJO pour la propriété virtuelle
            return {
                ...sessionObject,
                status: s.status // Accéder à la propriété virtuelle
            };
        }));

        console.log(`[Backend SessionController] Sessions de l'apprenant ${apprenantId}:`, populatedSessions.map(s => ({_id: s._id, title: s.title, status: s.status})));

        res.status(200).json(populatedSessions);

    } catch (error) {
        console.error("Erreur dans getApprenantSessions:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des sessions de l'apprenant.", error: error.message });
    }
};

// backend/controllers/sessionController.js

export const addEleveToSessionByEmail = async (req, res) => {
    try {
        const { id: sessionId } = req.params;
        const { email: eleveEmail } = req.body;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session non trouvée." });
        const eleveToAdd = await User.findOne({ email: eleveEmail });
        if (!eleveToAdd) return res.status(404).json({ message: "Élève non trouvé." });
        
        const isAlreadyEnrolled = session.elevesInscrits.some(e => e.userId.equals(eleveToAdd._id));
        if (isAlreadyEnrolled) { return res.status(400).json({ message: "Cet élève est déjà inscrit." }); }

        session.elevesInscrits.push({
            userId: eleveToAdd._id, nom: eleveToAdd.nom, prenom: eleveToAdd.prenom,
            email: eleveToAdd.email, role: 'eleve', dateInscription: new Date(),
        });

        // On initialise le parcours pour ce nouvel élève
        await initializeProgressionForStudents([eleveToAdd._id], session);

        const updatedSession = await session.save();
        const populatedSession = await populateSessionUsers(updatedSession);
        res.status(200).json(populatedSession);

    } catch (error) {
        console.error("Erreur dans addEleveToSessionByEmail:", error);
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};

export const removeEleveFromSession = async (req, res) => {
    try {
        const { id: sessionId } = req.params;
        const { eleveId } = req.body; // L'ID de l'élève à retirer

        const session = await Session.findById(sessionId);
        if (!session) { return res.status(404).json({ message: "Session non trouvée." }); }

        // Vérification d'autorisation (similaire à addEleveToSessionByEmail)
        if (req.user.role !== 'admin' && req.user.role !== 'formateur') {
            return res.status(403).json({ message: "Non autorisé à retirer des élèves de cette session." });
        }

        const initialLength = session.elevesInscrits.length;
        session.elevesInscrits = session.elevesInscrits.filter(
            (eleve) => !eleve.userId.equals(eleveId)
        );

        if (session.elevesInscrits.length === initialLength) {
            return res.status(404).json({ message: "Élève non trouvé dans la session." });
        }

        const updatedSession = await session.save();
        const populatedSession = await populateSessionUsers(updatedSession);
        res.status(200).json(populatedSession);

    } catch (error) {
        console.error("Erreur dans removeEleveFromSession:", error);
        res.status(500).json({ message: "Erreur serveur lors du retrait de l'élève.", error: error.message });
    }
};

export const toggleEleveMuteStatus = async (req, res) => {
    try {
        const { id: sessionId } = req.params;
        const { eleveId } = req.body; // L'ID de l'élève à mute/unmute

        const session = await Session.findById(sessionId);
        if (!session) { return res.status(404).json({ message: "Session non trouvée." }); }

        // Vérification d'autorisation
        if (req.user.role !== 'admin' && req.user.role !== 'formateur') {
            return res.status(403).json({ message: "Non autorisé à gérer le statut 'mute' des élèves." });
        }

        const eleveIndex = session.elevesInscrits.findIndex(
            (eleve) => eleve.userId.equals(eleveId)
        );

        if (eleveIndex === -1) {
            return res.status(404).json({ message: "Élève non trouvé dans la session." });
        }

        session.elevesInscrits[eleveIndex].isMuted = !session.elevesInscrits[eleveIndex].isMuted;

        const updatedSession = await session.save();
        const populatedSession = await populateSessionUsers(updatedSession);
        res.status(200).json(populatedSession);

    } catch (error) {
        console.error("Erreur dans toggleEleveMuteStatus:", error);
        res.status(500).json({ message: "Erreur serveur lors de la modification du statut 'mute' de l'élève.", error: error.message });
    }
};


// backend/controllers/sessionController.js

export const toggleAutonomy = async (req, res) => {
    try {
        const { id: sessionId } = req.params;
        const session = await Session.findById(sessionId);

        if (!session) { return res.status(404).json({ message: "Session non trouvée" }); }

        session.isAutonomyEnabled = !session.isAutonomyEnabled;

        // Si on active, on lance l'initialisation PUIS le déblocage
        if (session.isAutonomyEnabled) {
            const studentIds = session.elevesInscrits.map(e => e.userId);
            if (studentIds.length > 0) {
                // Étape 1 : S'assure que tout le monde a un parcours (entièrement bloqué)
                await initializeProgressionForStudents(studentIds, session);

                // Étape 2 : On force le déblocage du premier module
                const formation = await Formation.findById(session.formation).select('modules').lean();
                if (formation && formation.modules.length > 0) {
                    const firstModuleId = formation.modules[0]._id;
                    await ProgressionEleve.updateMany(
                        { user: { $in: studentIds }, session: sessionId, contentId: firstModuleId },
                        { $set: { status: 'en_cours', startedAt: new Date() } }
                    );
                    console.log(`[AUTONOMY] Le premier module a été explicitement débloqué pour ${studentIds.length} élève(s).`);
                }
            }
        }
        
        await session.save();
        const populatedSession = await populateSessionUsers(session);
        res.status(200).json(populatedSession);

    } catch (error) {
        console.error("Erreur dans toggleAutonomy:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};



// Dans backend/controllers/sessionController.js
export const togglePublishStatus = async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session non trouvée" });
        }

        // MODIFIÉ : On vérifie et modifie 'statutPublication'
        if (session.statutPublication === 'brouillon') {
            // ... (toute la logique de vérification reste la même)
            if (!session.planning || session.planning.length === 0) {
                return res.status(400).json({ message: "Impossible de publier : le planning est vide." });
            }
            
            session.statutPublication = 'publiée';
        } else {
            session.statutPublication = 'brouillon';
        }

        const updatedSession = await session.save();
        res.status(200).json(updatedSession);

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const addIntervenantToSession = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
        res.status(404);
        throw new Error('Session non trouvée');
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'formateur') {
        res.status(404);
        throw new Error('Aucun formateur trouvé avec cet email.');
    }

    // Vérifier si l'utilisateur est déjà dans la liste des formateurs/intervenants
    const alreadyExists = session.formateurs.some(f => f.userId.toString() === user._id.toString());
    if (alreadyExists) {
        res.status(400);
        throw new Error('Ce formateur est déjà intervenant pour cette session.');
    }

    const newIntervenant = {
        userId: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: 'formateur' // On spécifie le rôle dans le contexte de la session
    };

    session.formateurs.push(newIntervenant);
    await session.save();

    const updatedSession = await Session.findById(req.params.id).populate('formateurs.userId', 'nom prenom email photo');
    res.json(updatedSession);
});


export const removeIntervenantFromSession = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
        res.status(404);
        throw new Error('Session non trouvée');
    }

    session.formateurs = session.formateurs.filter(f => f.userId.toString() !== userId);
    await session.save();

    const updatedSession = await Session.findById(req.params.id).populate('formateurs.userId', 'nom prenom email photo');
    res.json(updatedSession);
});