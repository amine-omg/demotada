import StudyTimeLog from '../models/StudyTimeLog.js';

export const recordStudyTime = async (req, res) => {
    try {
        const { sessionId, pingIntervalSeconds, pageType } = req.body;
        const userId = req.user.id;

        if (!sessionId || !pingIntervalSeconds) {
            return res.status(400).json({ message: "Données manquantes" });
        }

        const now = new Date();
        const dateString = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
        const timeString = now.toLocaleTimeString('fr-FR', {
            timeZone: 'Europe/Paris',
            hour: '2-digit',
            minute: '2-digit'
        });

        let log = await StudyTimeLog.findOne({
            user: userId,
            session: sessionId,
            dateString: dateString
        });

        if (!log) {
            log = new StudyTimeLog({
                user: userId,
                session: sessionId,
                dateString: dateString,
                totalSeconds: 0,
                details: { live: 0, elearning: 0, classe: 0 },
                firstConnection: timeString,
                lastConnection: timeString
            });
        }

        log.totalSeconds += pingIntervalSeconds;
        if (pageType === 'live') log.details.live += pingIntervalSeconds;
        else if (pageType === 'elearning') log.details.elearning += pingIntervalSeconds;
        else if (pageType === 'classe') log.details.classe += pingIntervalSeconds;

        log.lastConnection = timeString;
        
        if (!log.firstConnection) {
            log.firstConnection = timeString;
        }

        await log.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur critique Tracker (recordStudyTime):", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// backend/controllers/studyTimeController.js

export const repairLogs = async (req, res) => {
    try {
        const { logIds } = req.body;
        if (!logIds || !Array.isArray(logIds)) return res.status(400).send();

        const logs = await StudyTimeLog.find({ _id: { $in: logIds } });
        
        for (let log of logs) {
            let updated = false;
            
            // Si l'info manque, on utilise la date de création du document MongoDB
            if (!log.firstConnection && log.createdAt) {
                log.firstConnection = new Date(log.createdAt).toLocaleTimeString('fr-FR', {
                    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit'
                });
                updated = true;
            }

            // Pour la fin, on utilise la date de dernière mise à jour
            if (!log.lastConnection && log.updatedAt) {
                log.lastConnection = new Date(log.updatedAt).toLocaleTimeString('fr-FR', {
                    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit'
                });
                updated = true;
            }

            if (updated) await log.save();
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Erreur réparation" });
    }
};

export const getUserStudyLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // On récupère les logs triés du plus récent au plus ancien
        // On "populate" la session pour récupérer son titre
        const logs = await StudyTimeLog.find({ user: userId })
            .populate('session', 'title') 
            .sort({ dateString: -1 });

        // On calcule le grand total en secondes
        const totalSecondsOverall = logs.reduce((acc, log) => acc + log.totalSeconds, 0);

        // On peut aussi aggréger par session pour faire un résumé propre
        const summaryBySession = {};
        logs.forEach(log => {
            const sessId = log.session ? log.session._id.toString() : 'inconnu';
            const sessTitle = log.session ? log.session.title : 'Session supprimée';
            
            if (!summaryBySession[sessId]) {
                summaryBySession[sessId] = {
                    title: sessTitle,
                    totalSeconds: 0,
                    details: { live: 0, elearning: 0, classe: 0 }
                };
            }
            summaryBySession[sessId].totalSeconds += log.totalSeconds;
            summaryBySession[sessId].details.live += log.details.live || 0;
            summaryBySession[sessId].details.elearning += log.details.elearning || 0;
            summaryBySession[sessId].details.classe += log.details.classe || 0;
        });

        res.status(200).json({ 
            success: true, 
            logs, 
            totalSecondsOverall,
            summaryBySession: Object.values(summaryBySession)
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des temps d'étude:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getSessionStudyLogs = async (req, res) => {
    try {
        const { sessionId, userId } = req.params;
        
        // On récupère uniquement les logs de CETTE session pour CET élève
        const logs = await StudyTimeLog.find({ user: userId, session: sessionId })
            .sort({ dateString: -1 });

        // On calcule les totaux
        const totalSeconds = logs.reduce((acc, log) => acc + log.totalSeconds, 0);
        const details = { live: 0, elearning: 0, classe: 0 };
        
        logs.forEach(log => {
            details.live += log.details?.live || 0;
            details.elearning += log.details?.elearning || 0;
            details.classe += log.details?.classe || 0;
        });

        res.status(200).json({
            success: true,
            totalSeconds,
            details,
            logs
        });

    } catch (error) {
        console.error("Erreur récupération logs session:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const addManualStudyTime = async (req, res) => {
    try {
        const { sessionId, userId, dateString, startTime, endTime, details } = req.body;

        // 1. Validation de l'amplitude horaire
        if (startTime && endTime) {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            
            const amplitudeSecondes = ((endH * 60 + endM) - (startH * 60 + startM)) * 60;
            const totalDemandeSecondes = (details.live || 0) + (details.elearning || 0) + (details.classe || 0);

            if (totalDemandeSecondes > amplitudeSecondes) {
                return res.status(400).json({ 
                    message: "Le temps d'étude dépasse l'amplitude horaire entre la 1ère et dernière connexion." 
                });
            }
        }

        // 2. Préparation de la date
        const date = new Date(dateString);
        date.setUTCHours(0, 0, 0, 0);

        // 3. Récupération ou Création du log
        let log = await StudyTimeLog.findOne({
            user: userId,
            session: sessionId,
            dateString: date.toISOString()
        });

        if (!log) {
            log = new StudyTimeLog({
                user: userId, session: sessionId,
                dateString: date.toISOString(),
                totalSeconds: 0,
                details: { live: 0, elearning: 0, classe: 0 }
            });
        }

        // 4. Mise à jour des temps et des heures de connexion
        log.details.live += (details.live || 0);
        log.details.elearning += (details.elearning || 0);
        log.details.classe += (details.classe || 0);
        log.totalSeconds = log.details.live + log.details.elearning + log.details.classe;

        // On n'écrase l'heure de début/fin que si elle est fournie
        if (startTime) log.firstConnection = startTime;
        if (endTime) log.lastConnection = endTime;

        await log.save();

        res.status(200).json({ success: true, log });
    } catch (error) {
        console.error("Erreur lors de l'injection manuelle:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteStudyLog = async (req, res) => {
    try {
        const { logId } = req.params;

        // On vérifie si le log existe
        const log = await StudyTimeLog.findById(logId);
        if (!log) {
            return res.status(404).json({ message: "Journal d'activité introuvable" });
        }

        // Suppression (Seul un admin ou le propriétaire devrait pouvoir, 
        // mais ici on est dans le contexte Admin Session)
        await StudyTimeLog.findByIdAndDelete(logId);

        res.status(200).json({ success: true, message: "Log supprimé avec succès" });
    } catch (error) {
        console.error("Erreur suppression log:", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression" });
    }
};