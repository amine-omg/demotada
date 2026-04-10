// backend/controllers/coursController.js
import axios from 'axios';
import jwt from 'jsonwebtoken';
import Cours from '../models/Cours.js';
import Session from '../models/Session.js';
import User from '../models/User.js';



// Liste des jours fériés en France (exemple pour 2025-2026)
const joursFeries = [
    '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', 
    '2025-06-09', '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
    '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-14', '2026-05-25', 
    '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25',
].map(dateString => new Date(dateString + 'T00:00:00Z').getTime());

const generateCoursDays = async (startDate, endDate, sessionId, createdBy) => {
    const coursDays = [];
    let currentDate = new Date(startDate);
    currentDate.setUTCHours(0, 0, 0, 0);

    let order = 0;
    while (currentDate.getTime() <= endDate.getTime()) {
        const dayOfWeek = currentDate.getUTCDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const isHoliday = joursFeries.includes(currentDate.getTime());

        if (!isWeekend && !isHoliday) {
            coursDays.push({
                session: sessionId,
                date: new Date(currentDate),
                title: `Jour ${order + 1} de cours`,
                orderInSession: order,
                createdBy: createdBy,
                isMorningActive: true,
                isAfternoonActive: true,
            });
            order++;
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (coursDays.length > 0) {
        try {
            
            const createdCours = await Cours.insertMany(coursDays);
            return createdCours;
        } catch (error) {
            console.error("generateCoursDays: Erreur lors de l'insertion des cours:", error);
            if (error.code === 11000) {
                console.error("generateCoursDays: Erreur de doublon.");
            }
            throw error;
        }
    }
    return [];
};





export const createCours = async (req, res) => {
    try {
        const { session, date, title, description, startTime, endTime, meetLink, topicsCovered, isMorningActive, isAfternoonActive, orderInSession } = req.body;
        const createdBy = req.user.id;

        if (!session || !date) {
            return res.status(400).json({ message: "L'ID de la session et la date sont requis." });
        }

        const existingSession = await Session.findById(session);
        if (!existingSession) {
            return res.status(404).json({ message: "Session parente non trouvée." });
        }

        const newCours = new Cours({ session, date, title, description, startTime, endTime, meetLink, topicsCovered, isMorningActive, isAfternoonActive, orderInSession, createdBy });

        const savedCours = await newCours.save();
        await addZoomLinkToCours(newCours);
        res.status(201).json(savedCours);
    } catch (error) {
        console.error("Erreur dans createCours:", error);
        res.status(400).json({ message: "Erreur lors de la création du cours", error: error.message });
    }
};

export const getCoursForSession = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ message: "L'ID de la session est requis." });
        }

        const cours = await Cours.find({ session: sessionId })
            .populate('createdBy', 'nom prenom photo')
            .populate('attendance.user', 'nom prenom photo')
            .sort({ date: 1, orderInSession: 1 });

        return res.status(200).json(cours || []);

    } catch (error) {
        console.error("Erreur dans getCoursForSession:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const getCoursById = async (req, res) => {
    try {
        const cours = await Cours.findById(req.params.id)
            .populate('createdBy', 'nom prenom photo')
            .populate('attendance.user', 'nom prenom photo');
        if (!cours) {
            return res.status(404).json({ message: "Journée de cours non trouvée" });
        }
        res.status(200).json(cours);
    } catch (error) {
        console.error("Erreur dans getCoursById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const updateCours = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedCours = await Cours.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedCours) {
            return res.status(404).json({ message: "Journée de cours non trouvée" });
        }
        res.status(200).json(updatedCours);
    } catch (error) {
        console.error("Erreur dans updateCours:", error);
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

export const deleteCours = async (req, res) => {
    try {
        const cours = await Cours.findById(req.params.id);
        if (!cours) {
            return res.status(404).json({ message: "Journée de cours non trouvée" });
        }
        await cours.deleteOne();
        res.status(200).json({ message: "Journée de cours supprimée" });
    } catch (error) {
        console.error("Erreur dans deleteCours:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const generateCoursForSession = async (session, createdBy) => {
    if (session.type !== 'programme' || !session.dateDebut || !session.dateFin) {
        return [];
    }
    await Cours.deleteMany({ session: session._id });
    const createdCours = await generateCoursDays(session.dateDebut, session.dateFin, session._id, createdBy);
    return createdCours;
};

/**
 * @desc    Trouve le prochain cours à venir ou en cours pour une session donnée.
 * @route   GET /api/cours/next?sessionId=...
 * @access  Private
 */
export const getNextCoursForSession = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ message: "L'ID de la session est requis." });
        }

        const now = new Date();

        // --- AJOUT : VÉRIFICATION DU MODE "FORCE LIVE" ---
        // On cherche d'abord si un cours a été forcé en direct pour le test.
        const forcedCours = await Cours.findOne({
            session: sessionId,
            forceLiveUntil: { $gt: now } // Si la date de forçage n'est pas encore passée
        }).populate('createdBy', 'nom prenom photo');

        if (forcedCours) {
            console.log(`[Backend CoursController] Cours FORCÉ EN DIRECT trouvé: ${forcedCours.title}`);
            return res.status(200).json({
                nextCours: forcedCours,
                isLive: true,
                message: "Cours en direct (forcé pour test)."
            });
        }
        // --- FIN DE L'AJOUT ---

        // Si aucun cours n'est forcé, on continue avec la logique normale.
        const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });

        const liveCours = await Cours.findOne({
            session: sessionId,
            date: todayUTC,
            startTime: { $lte: currentTime },
            endTime: { $gte: currentTime }
        }).populate('createdBy', 'nom prenom photo');

        if (liveCours) {
            return res.status(200).json({ nextCours: liveCours, isLive: true });
        }

        const nextCoursCandidate = await Cours.findOne({
            session: sessionId,
            $or: [
                { date: todayUTC, startTime: { $gt: currentTime } },
                { date: { $gt: todayUTC } }
            ]
        }).sort({ date: 1, startTime: 1 }).populate('createdBy', 'nom prenom photo');

        if (nextCoursCandidate) {
            return res.status(200).json({ nextCours: nextCoursCandidate, isLive: false });
        }

        const session = await Session.findById(sessionId);
        if (session && session.dateFin && new Date(session.dateFin) < now) {
            return res.status(200).json({ nextCours: null, isLive: false, message: "Tous les cours sont terminés." });
        }

        return res.status(200).json({ nextCours: null, isLive: false, message: "Aucun cours programmé." });

    } catch (error) {
        console.error("[Backend CoursController] Erreur dans getNextCoursForSession:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// --- NOUVELLE FONCTION EXPORTÉE ---
/**
 * @desc    Force un cours à être "en direct" pour 5 minutes (pour test)
 * @route   POST /api/cours/:id/force-live
 * @access  Privé
 */
export const forceCoursLive = async (req, res) => {
    try {
        const cours = await Cours.findById(req.params.id);

        if (cours) {
            // Le cours sera considéré "live" pour les 5 prochaines minutes
            cours.forceLiveUntil = new Date(Date.now() + 5 * 60 * 1000);
            await cours.save();
            res.json({ message: `Le cours "${cours.title}" est maintenant en direct pour 5 minutes.` });
        } else {
            res.status(404).json({ message: 'Cours non trouvé' });
        }
    } catch (error) {
        console.error("Erreur dans forceCoursLive:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


