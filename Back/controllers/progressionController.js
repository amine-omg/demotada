// backend/controllers/progressionController.js
import ProgressionContent from '../models/ProgressionContent.js';
import Module from '../models/Module.js';
import Chapter from '../models/Chapter.js';
import Formation from '../models/Formation.js';
import asyncHandler from 'express-async-handler';

/**
 * Récupère toute la progression d'une session (Lecture unifiée pour Admin/Apprenant)
 * REMPLACE: getModuleProgressionForSession
 */
export const getModuleProgressionForSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    let query = { session: sessionId };

    // Sécurité : l'apprenant ne voit que ses données, l'admin voit tout
    if (req.user.role === 'apprenant') {
        query.user = req.user.id;
    }

    // Utilisation du modèle unifié ProgressionContent
    const progressions = await ProgressionContent.find(query)
        .populate('user', 'nom prenom email photo')
        .lean();
    
    res.status(200).json(progressions);
});

/**
 * Récupère ou initialise la progression des chapitres d'un module pour un élève
 * REMPLACE: getModuleProgression
 */
export const getModuleProgression = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const { sessionId } = req.query;
    const userId = req.user.id;

    const module = await Module.findById(moduleId).select('chapters').lean();
    if (!module || !module.chapters || module.chapters.length === 0) {
        return res.status(200).json([]);
    }
    
    const chapterIds = module.chapters;
    const firstChapterId = chapterIds[0];

    // On cherche si la progression existe déjà (via le champ 'content')
    const existingProgression = await ProgressionContent.findOne({ 
        user: userId, 
        session: sessionId, 
        content: firstChapterId 
    });

    if (!existingProgression) {
        // Initialisation du premier chapitre en 'en_cours' et des autres en 'bloque'
        const chapterDocs = chapterIds.map((chapterId, index) => ({
            user: userId,
            session: sessionId,
            content: chapterId,
            contentType: 'Chapter',
            module: moduleId,
            status: index === 0 ? 'en_cours' : 'bloque',
        }));
        await ProgressionContent.insertMany(chapterDocs);
    }

    const chapterProgressions = await ProgressionContent.find({
        user: userId,
        session: sessionId,
        module: moduleId,
        contentType: 'Chapter'
    });

    res.status(200).json(chapterProgressions);
});

/**
 * Initialise toutes les activités d'un chapitre en mode 'a_faire'
 */
export const initializeChapterActivities = asyncHandler(async (req, res) => {
    const { sessionId, chapterId } = req.params;
    const userId = req.user.id;

    const chapter = await Chapter.findById(chapterId).lean();
    if (!chapter || !chapter.contents) {
        return res.status(404).json({ message: "Chapitre ou contenus non trouvés." });
    }

    const bulkOps = chapter.contents.map(activity => ({
        updateOne: {
            filter: { user: userId, session: sessionId, content: activity._id },
            update: {
                $setOnInsert: {
                    user: userId,
                    session: sessionId,
                    content: activity._id,
                    contentType: 'Activity',
                    status: 'a_faire',
                    chapter: chapterId,
                    module: chapter.module
                }
            },
            upsert: true
        }
    }));

    if (bulkOps.length > 0) {
        await ProgressionContent.bulkWrite(bulkOps);
    }

    const progressions = await ProgressionContent.find({ user: userId, session: sessionId });
    res.status(200).json(progressions);
});

/**
 * Logique de complétion avec cascade automatique (Activité -> Chapitre -> Module -> Suivant)
 */
export const completeContent = asyncHandler(async (req, res) => {
    const { sessionId, contentId, contentType, score, totalScore } = req.body;
    const userId = req.user.id;

    if (!sessionId || !contentId || !contentType) {
        return res.status(400).json({ message: "Champs requis manquants." });
    }

    // CORRECTION 1 : Sécuriser le type pour que Mongoose l'accepte toujours
    const dbContentType = (contentType === 'Quiz') ? 'Activity' : contentType;

    // 1. Mise à jour du contenu actuel
    await ProgressionContent.findOneAndUpdate(
        { user: userId, session: sessionId, content: contentId },
        { 
            $set: { 
                status: 'termine', 
                contentType: dbContentType, 
                score: Number(score) || 0,
                totalScore: Number(totalScore) || 0, 
                completedAt: new Date()
            } 
        },
        { upsert: true }
    );

    // 2. Cascade : Si on finit une activité, vérifie si le chapitre est complété
    if (dbContentType === 'Activity') {
        // CORRECTION 2 : Chercher dans "contents._id" au lieu de "contents"
        const parentChapter = await Chapter.findOne({ "contents._id": contentId }).select('_id contents module').lean();
        
        if (parentChapter) {
            // Extraire uniquement les IDs pour compter correctement
            const contentIds = parentChapter.contents.map(c => c._id.toString());

            const completedCount = await ProgressionContent.countDocuments({
                user: userId,
                session: sessionId,
                content: { $in: contentIds },
                status: 'termine'
            });

            // Si toutes les activités sont terminées
            if (completedCount >= contentIds.length) {
                await ProgressionContent.updateOne(
                    { user: userId, session: sessionId, content: parentChapter._id },
                    { $set: { status: 'termine', contentType: 'Chapter', completedAt: new Date() } },
                    { upsert: true }
                );
                
                // On passe l'info au bloc suivant pour vérifier le module
                req.body.contentId = parentChapter._id.toString();
                req.body.contentType = 'Chapter';
            }
        }
    }

    // 3. Cascade : Si un chapitre est fini, vérifie si le module est complété
    if (req.body.contentType === 'Chapter') {
        const parentModule = await Module.findOne({ chapters: req.body.contentId }).select('_id chapters formation').lean();
        
        if (parentModule) {
            const chapterIds = parentModule.chapters.map(c => c.toString());

            const completedChapters = await ProgressionContent.countDocuments({
                user: userId,
                session: sessionId,
                content: { $in: chapterIds },
                status: 'termine'
            });

            if (completedChapters >= chapterIds.length) {
                await ProgressionContent.updateOne(
                    { user: userId, session: sessionId, content: parentModule._id },
                    { $set: { status: 'termine', contentType: 'Module', completedAt: new Date() } },
                    { upsert: true }
                );

                // Débloquer le module suivant
                const formation = await Formation.findById(parentModule.formation).select('modules').lean();
                if (formation) {
                    const moduleIds = formation.modules.map(m => m.toString());
                    const currentIdx = moduleIds.indexOf(parentModule._id.toString());

                    if (currentIdx > -1 && currentIdx < moduleIds.length - 1) {
                        const nextModuleId = moduleIds[currentIdx + 1];
                        await ProgressionContent.updateOne(
                           { user: userId, session: sessionId, content: nextModuleId },
                           { $set: { status: 'en_cours', contentType: 'Module' } },
                           { upsert: true }
                        );
                    }
                }
            }
        }
    }
    
    res.status(200).json({ message: "Progression enregistrée." });
});

export const toggleManualLock = asyncHandler(async (req, res) => {
    const { userId, sessionId, contentId, status, contentType, moduleId, chapterId } = req.body;

    if (!userId || !sessionId || !contentId || !status) {
        return res.status(400).json({ message: "Données manquantes pour le verrou." });
    }

    const progression = await ProgressionContent.findOneAndUpdate(
        { user: userId, session: sessionId, content: contentId }, 
        { 
            status: status,
            contentType: contentType || 'Activity',
            module: moduleId || (contentType === 'Module' ? contentId : null),
            chapter: chapterId || (contentType === 'Chapter' ? contentId : null)
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(progression);
});