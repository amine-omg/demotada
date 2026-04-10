// backend/controllers/formationController.js
import Formation from '../models/Formation.js';
import Module from '../models/Module.js';
import User from '../models/User.js';
import Chapter from '../models/Chapter.js';
import Quiz from '../models/Quiz.js';
import Lesson from '../models/Lesson.js';
import Session from '../models/Session.js';
import Exercise from '../models/Exercise.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';


const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://aeefe0122652e55d5b73f7f2003ce076.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Fonction utilitaire pour peupler les formateurs agréés
const populateApprovedInstructors = async (formation) => {
    if (!formation || !formation.approvedInstructors || formation.approvedInstructors.length === 0) {
        return formation;
    }
    const instructorIds = formation.approvedInstructors.map(id => id);
    const instructorDetails = await User.find({ _id: { $in: instructorIds } }).select('nom prenom email').lean();
    const populatedInstructors = instructorIds.map(instructorId => {
        const detail = instructorDetails.find(ud => ud._id.equals(instructorId));
        return detail ? { _id: detail._id, nom: detail.nom, prenom: detail.prenom, email: detail.email } : null;
    }).filter(detail => detail !== null);
    const formationObject = formation.toObject ? formation.toObject() : { ...formation };
    formationObject.approvedInstructors = populatedInstructors;
    return formationObject;
};

// @desc    Créer une nouvelle formation
// @route   POST /api/formations
// @access  Private (Admin, Instructor)
export const createFormation = async (req, res) => {
    try {
        const {
            title, description, image, status, price, category,
            objectives, publicCible, videoPresentation, descriptionCourte, descriptionLongue,
            isContinuousEnrollmentEnabled, continuousEnrollmentDetails, approvedInstructors,
            domain, tags, ecole,
            validationStatus
         } = req.body;

        const newFormation = new Formation({
            title, description, image, status, price, category,
            objectives, publicCible, videoPresentation, descriptionCourte, descriptionLongue,
            isContinuousEnrollmentEnabled, continuousEnrollmentDetails, approvedInstructors,
            domain, tags,
            validationStatus: validationStatus || 'pending',
            createdBy: req.user.id,
            ecole: ecole || null 
        });

        const savedFormation = await newFormation.save();
        const populatedFormation = await Formation.findById(savedFormation._id).populate('createdBy', 'nom prenom');
        res.status(201).json(populatedFormation);
    } catch (error) {
        console.error("Erreur dans createFormation:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la création de la formation', error: error.message });
    }
};

export const getFormations = async (req, res) => {
    try {
        const { createdBy, validationStatus, domain, tags, publicOnly, ecoleId } = req.query;
        let query = {};

        // --- NOUVELLE LOGIQUE DE FILTRAGE ---
        if (ecoleId) {
            // Priorité 1: Si ecoleId est fourni, on filtre par école
            query.ecole = ecoleId;
        } else if (createdBy) {
            // Priorité 2: Sinon, on filtre par créateur (cas du formateur)
            query.createdBy = createdBy;
        } else {
            // Priorité 3: Comportement par défaut pour les utilisateurs connectés
            if (req.user && req.user.role !== 'admin' && publicOnly !== 'true') {
                 if (req.user.role === 'ecole' && req.user.associatedEntity) {
                    query.ecole = req.user.associatedEntity;
                } else {
                    query.createdBy = req.user.id;
                }
            }
            // Si l'utilisateur est admin et qu'aucun filtre n'est appliqué, la query reste vide `{}`
            // ce qui signifie "tout voir". C'est un comportement que vous pourriez vouloir changer plus tard.
        }
        // --- FIN DE LA NOUVELLE LOGIQUE ---

        if (validationStatus) {
            query.validationStatus = validationStatus;
        }

        if (domain) {
            const domainArray = Array.isArray(domain) ? domain : String(domain).split(',');
            query.domain = { $in: domainArray.map(d => d.trim()) };
        }

        if (tags) {
            const tagsArray = Array.isArray(tags) ? tags : String(tags).split(',');
            query.tags = { $in: tagsArray.map(tag => tag.trim()) };
        }

        if (publicOnly === 'true') {
            query.status = 'public';
            query.validationStatus = 'approved';
        }

        const formations = await Formation.find(query)
            .populate('createdBy', 'nom prenom')
            .populate('category', 'name');

        // Correction de la logique de tri (sans TypeScript)
        const statusOrder = { 'public': 1, 'draft': 2, 'non_repertoriee': 3, 'cachee': 4, 'disabled': 5 };
        formations.sort((a, b) => {
            const orderA = statusOrder[a.status] || 99;
            const orderB = statusOrder[b.status] || 99;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        res.status(200).json(formations);
    } catch (error) {
        console.error("Erreur dans getFormations:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des formations', error: error.message });
    }
};

export const getFormationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.role : null;

        const formation = await Formation.findById(id).lean()
            .populate({
                path: 'modules',
                select: 'name description order chapters',
                options: { sort: { order: 1 } },
                populate: {
                    path: 'chapters',
                    select: 'title description contents order', 
                    options: { sort: { order: 1 } },
                    populate: {
                        path: 'contents',
                        model: 'Activity', 
                        select: 'title type description objectifs dureeEstimee notesPedagogiques pdfUrl blocks isOptionalForCompletion totalPossibleScore passingScore minScoreToPass'                    }
                }
            })
            .populate('createdBy', '_id nom prenom email')
            .populate('category', 'name')
            .populate('ecole', 'nom');

        if (!formation) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        const fullyPopulatedFormation = await populateApprovedInstructors(formation);

        // --- Logique de permission (inchangée, elle est déjà correcte) ---
        let hasPermission = false;
        
        const isPubliclyApproved = fullyPopulatedFormation.status === 'public' && fullyPopulatedFormation.validationStatus === 'approved';
        if (isPubliclyApproved) {
            hasPermission = true;
        }

        if (!hasPermission) {
            const ownerId = fullyPopulatedFormation.createdBy?._id?.toString();
            const isOwner = userId && ownerId === userId.toString();
            const approvedInstructorUserIds = Array.isArray(fullyPopulatedFormation.approvedInstructors) ? fullyPopulatedFormation.approvedInstructors.map(i => i._id?.toString()) : [];
            const isApprovedInstructor = userId && approvedInstructorUserIds.includes(userId.toString());
            const isAdmin = userRole === 'admin';
            if (isAdmin || isOwner || isApprovedInstructor) {
                hasPermission = true;
            }
        }
        
        if (!hasPermission && userId) {
            const sessionEnrollment = await Session.findOne({ 
                formation: id, 
                'elevesInscrits.userId': userId 
            });
            if (sessionEnrollment) {
                hasPermission = true;
            }
        }

        if (!hasPermission && userId) {
            const intervenantEnrollment = await Session.findOne({
                formation: id, // La session doit appartenir à cette formation
                'formateurs.userId': userId // L'utilisateur doit être dans la liste des formateurs/intervenants
            });
            if (intervenantEnrollment) {
                hasPermission = true;
            }
        }

        if (!hasPermission) {
            return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas autorisé à voir cette formation.' });
        }

        res.status(200).json(fullyPopulatedFormation);

    } catch (error) {
        console.error('Erreur dans getFormationById:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

/**
 * @desc    Mettre à jour une formation
 * @route   PUT /api/formations/:id
 * @access  Private (Admin, Instructor)
 */
export const updateFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = req.user;

        // 1. Récupérer la formation pour vérifier les permissions
        const formation = await Formation.findById(id);
        if (!formation) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        // 2. Définir les permissions
        const isOwner = formation.createdBy.toString() === user._id.toString();
        const isGlobalAdmin = user.role === 'admin';
        const isEcoleAdmin = user.role === 'ecole' && formation.ecole && user.associatedEntity && formation.ecole.toString() === user.associatedEntity._id.toString();

        // 3. Appliquer la sécurité
        if (!isOwner && !isGlobalAdmin && !isEcoleAdmin) {
            return res.status(403).json({ message: "Vous n'avez pas la permission de modifier cette formation." });
        }

        // 4. Cas spécial : un admin d'école retire la formation
        if (isEcoleAdmin && updateData.ecole === null) {
            formation.ecole = null;
            await formation.save();
            const populatedFormation = await populateApprovedInstructors(formation);
            return res.status(200).json(populatedFormation);
        }

        // 5. Logique de mise à jour générale
        if (updateData.approvedInstructors && Array.isArray(updateData.approvedInstructors)) {
            updateData.approvedInstructors = updateData.approvedInstructors.map((instructor) =>
                instructor._id || instructor
            ).filter((id) => id !== null && id !== undefined);
        }

        const updatedFormation = await Formation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('ecole', 'nom'); // <-- AJOUT DE LA CORRECTION ICI

        if (!updatedFormation) {
            return res.status(404).json({ message: 'Formation non trouvée lors de la mise à jour' });
        }

        // 6. Populer les données et envoyer la réponse finale
        const populatedFormation = await populateApprovedInstructors(updatedFormation);
        res.status(200).json(populatedFormation);

    } catch (error) {
        console.error("Erreur dans updateFormation:", error);
        res.status(400).json({ message: "Erreur lors de la mise à jour de la formation", error: error.message });
    }
};

export const duplicateElement = async (req, res) => {
  try {
    const { sourceId, type, contentType, targetFormationId, targetModuleId, targetChapterId } = req.body;

    // --- DUPLICATION DE MODULE ---
    if (type === 'Module') {
      const sourceModule = await Module.findById(sourceId).lean();
      if (!sourceModule) return res.status(404).json({ message: "Module source introuvable." });

      const moduleData = { ...sourceModule };
      delete moduleData._id;
      delete moduleData.id; // <-- CRUCIAL: Suppression du virtual
      delete moduleData.createdAt;
      delete moduleData.updatedAt;
      
      const newModule = new Module({
        ...moduleData,
        _id: new mongoose.Types.ObjectId(), // <-- CRUCIAL: On force un ID neuf
        name: `${moduleData.name} (Copie)`,
        formation: targetFormationId,
        chapters: []
      });
      await newModule.save();

      const sourceChapters = await Chapter.find({ module: sourceId }).lean();
      
      for (const chapData of sourceChapters) {
        const oldChapterContents = chapData.contents || [];
        delete chapData._id;
        delete chapData.id; // <-- CRUCIAL
        delete chapData.createdAt;
        delete chapData.updatedAt;

        const newChap = new Chapter({
          ...chapData,
          _id: new mongoose.Types.ObjectId(), // <-- CRUCIAL
          formation: targetFormationId,
          module: newModule._id,
          contents: [] 
        });
        await newChap.save();
        
        // Copie des contenus imbriqués si le modèle Activity existe
        if (oldChapterContents.length > 0) {
            const ActivityModel = mongoose.model('Activity');
            const sourceActivities = await ActivityModel.find({ _id: { $in: oldChapterContents } }).lean();
            
            for (const actData of sourceActivities) {
                delete actData._id; delete actData.id; delete actData.createdAt; delete actData.updatedAt;
                const newActivity = new ActivityModel({
                    ...actData,
                    _id: new mongoose.Types.ObjectId(),
                    formation: targetFormationId,
                    chapter: newChap._id
                });
                await newActivity.save();
                newChap.contents.push(newActivity._id);
            }
            await newChap.save(); 
        }

        newModule.chapters.push(newChap._id);
      }
      
      await newModule.save();
      await Formation.findByIdAndUpdate(targetFormationId, { $push: { modules: newModule._id } });
      
      return res.status(200).json({ message: "Module dupliqué avec succès", newModule });
    }

    // --- DUPLICATION DE CHAPITRE ---
    if (type === 'Chapter') {
      const sourceChapter = await Chapter.findById(sourceId).lean();
      if (!sourceChapter) return res.status(404).json({ message: "Chapitre source introuvable." });

      const oldChapterContents = sourceChapter.contents || [];
      const chapData = { ...sourceChapter };
      delete chapData._id;
      delete chapData.id; // <-- CRUCIAL
      delete chapData.createdAt;
      delete chapData.updatedAt;

      const newChapter = new Chapter({
        ...chapData,
        _id: new mongoose.Types.ObjectId(), // <-- CRUCIAL
        title: `${chapData.title} (Copie)`,
        formation: targetFormationId,
        module: targetModuleId,
        contents: [] 
      });
      await newChapter.save();

      // Copie des contenus du chapitre
      if (oldChapterContents.length > 0) {
          const ActivityModel = mongoose.model('Activity');
          const sourceActivities = await ActivityModel.find({ _id: { $in: oldChapterContents } }).lean();
          
          for (const actData of sourceActivities) {
              delete actData._id; delete actData.id; delete actData.createdAt; delete actData.updatedAt;
              const newActivity = new ActivityModel({
                  ...actData,
                  _id: new mongoose.Types.ObjectId(),
                  formation: targetFormationId,
                  chapter: newChapter._id
              });
              await newActivity.save();
              newChapter.contents.push(newActivity._id);
          }
          await newChapter.save();
      }

      await Module.findByIdAndUpdate(targetModuleId, { $push: { chapters: newChapter._id } });
      return res.status(200).json({ message: "Chapitre dupliqué avec succès", newChapter });
    }

    // --- DUPLICATION DE CONTENU ---
    if (type === 'Content') {
      const targetChapter = await Chapter.findById(targetChapterId);
      if (!targetChapter) return res.status(404).json({ message: "Chapitre cible introuvable." });

      // Résolution dynamique du modèle selon le type exact (Lesson, Quiz, etc.)
      let ModelToUse;
      try {
         if (contentType === 'Lesson') ModelToUse = mongoose.model('Lesson');
         else if (contentType === 'Quiz') ModelToUse = mongoose.model('Quiz');
         else if (contentType === 'Exercise') ModelToUse = mongoose.model('Exercise');
         else if (contentType === 'Support') ModelToUse = mongoose.model('Support');
         else ModelToUse = mongoose.model('Activity'); // Base discriminator
      } catch (err) {
         ModelToUse = mongoose.model('Activity'); 
      }

      const originalContent = await ModelToUse.findById(sourceId).lean();
      if (!originalContent) return res.status(404).json({ message: "Contenu source introuvable." });

      const contentData = { ...originalContent };
      delete contentData._id;
      delete contentData.id; // <-- CRUCIAL
      delete contentData.createdAt;
      delete contentData.updatedAt;

      const newContent = new ModelToUse({
        ...contentData,
        _id: new mongoose.Types.ObjectId(), // <-- CRUCIAL
        title: `${contentData.title} (Copie)`,
        formation: targetFormationId,
        chapter: targetChapterId      
      });

      await newContent.save();

      targetChapter.contents.push(newContent._id);
      await targetChapter.save();

      return res.status(200).json({ message: "Contenu dupliqué avec succès", newContent });
    }

    return res.status(400).json({ message: "Type de duplication non supporté." });

  } catch (error) {
    console.error("Erreur dans duplicateElement:", error);
    res.status(500).json({ message: "Erreur serveur lors de la duplication.", details: error.message });
  }
};

/**
 * @desc    Supprimer une formation
 * @route   DELETE /api/formations/:id
 * @access  Private (Admin, Instructor)
 */
export const deleteFormation = async (req, res) => {
    try {
        const formation = await Formation.findById(req.params.id);
        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée." });
        }
        await Chapter.deleteMany({ formation: formation._id });
        await formation.deleteOne();
        res.status(200).json({ message: "Formation supprimée avec succès et ses chapitres liés." });
    } catch (error) {
        console.error("Erreur dans deleteFormation:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression de la formation', error: error.message });
    }
};

// --- Fonctions de Chapitre (restaurées et vérifiées précédemment) ---
export const addChapterToFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        
        const formation = await Formation.findById(id);
        if (!formation) { return res.status(404).json({ message: "Formation non trouvée." }); }

        // --- DÉBUT DE LA LOGIQUE D'ORDRE ---
        // On compte combien de chapitres existent déjà pour cette formation
        const chapterCount = await Chapter.countDocuments({ formation: id });
        const newOrder = chapterCount; // L'ordre commence à 0, donc le N-ième élément a l'ordre N-1
        // --- FIN DE LA LOGIQUE D'ORDRE ---

        const newChapter = new Chapter({
            title,
            description,
            order: newOrder, // On assigne le nouvel ordre
            formation: id,
            createdBy: req.user.id
        });

        const savedChapter = await newChapter.save();
        res.status(201).json(savedChapter);
    } catch (error) {
        // ... gestion d'erreur
    }
};

export const updateChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const updateData = req.body;
        const updatedChapter = await Chapter.findByIdAndUpdate(
            chapterId, updateData, { new: true, runValidators: true }
        );
        if (!updatedChapter) { return res.status(404).json({ message: "Chapitre non trouvé." }); }
        res.status(200).json(updatedChapter);
    } catch (error) {
        console.error("Erreur dans updateChapter:", error);
        res.status(400).json({ message: "Erreur lors de la mise à jour du chapitre", error: error.message });
    }
};

export const createQuiz = async (req, res) => {
    try {
        const { title, description, formation, chapter, questions, allowedErrors, errorScope, isBlocking, timeLimit, passingScore } = req.body;
        if (!formation || !chapter) { return res.status(400).json({ message: "Les IDs de la formation et du chapitre sont requis." }); }
        const newQuiz = new Quiz({
            title, description, formation, chapter, questions, allowedErrors, errorScope, isBlocking, timeLimit, passingScore, createdBy: req.user.id
        });
        const savedQuiz = await newQuiz.save();
        const parentChapter = await Chapter.findById(chapter);
        if (!parentChapter) { await Quiz.findByIdAndDelete(savedQuiz._id); return res.status(404).json({ message: "Chapitre parent non trouvé pour lier le quiz." }); }
        const newContentOrder = parentChapter.contents.length;
        parentChapter.contents.push({ type: 'quiz', title: savedQuiz.title, order: newContentOrder, quizRef: savedQuiz._id });
        await parentChapter.save();
        res.status(201).json(savedQuiz);
    } catch (error) {
        console.error("Erreur dans createQuiz (formationController):", error);
        res.status(400).json({ message: "Erreur lors de la création du quiz", error: error.message });
    }
};

/**
 * @desc    Réorganise les chapitres d'une formation
 * @route   PUT /api/formations/:id/reorder-chapters
 * @access  Private
 */
export const reorderChapters = async (req, res) => {
    try {
        // Le corps de la requête contiendra un tableau d'IDs dans le nouvel ordre
        const { orderedChapterIds } = req.body;

        if (!Array.isArray(orderedChapterIds)) {
            return res.status(400).json({ message: "Le corps de la requête doit contenir un tableau d'IDs." });
        }

        // On crée une liste d'opérations de mise à jour à effectuer en une seule fois
        const bulkOps = orderedChapterIds.map((chapterId, index) => ({
            updateOne: {
                filter: { _id: chapterId },
                update: { $set: { order: index } }
            }
        }));

        // On exécute toutes les mises à jour en une seule requête pour plus d'efficacité
        await Chapter.bulkWrite(bulkOps);

        res.status(200).json({ message: "L'ordre des chapitres a été mis à jour." });

    } catch (error) {
        console.error("Erreur dans reorderChapters:", error);
        res.status(500).json({ message: "Erreur serveur lors de la réorganisation." });
    }
};

export const reorderContents = async (req, res) => {
    try {
        const { contents } = req.body; // IDs des activités (Activity)
        const { id } = req.params;     // ID du chapitre

        // 1. Mise à jour du tableau 'contents' dans Chapter
        await Chapter.findByIdAndUpdate(id, { $set: { contents: contents } });

        // 2. Mise à jour du champ 'order' dans chaque Activity
        const updatePromises = contents.map((activityId, index) => {
            return Activity.findByIdAndUpdate(activityId, { order: index });
        });
        await Promise.all(updatePromises);

        res.status(200).json({ message: "Ordre des contenus mis à jour" });
    } catch (error) {
        res.status(400).json({ message: "Erreur réorganisation contenus", error: error.message });
    }
};

/**
 * @desc    Récupère tous les modules pour une formation spécifique.
 * @route   GET /api/formations/:formationId/modules
 * @access  Private
 */
export const getModulesForFormation = async (req, res) => {
    try {
        const { formationId } = req.params;

        // On cherche la formation et on peuple le champ 'modules' pour avoir les détails
        const formation = await Formation.findById(formationId).populate({
            path: 'modules',
            options: { sort: { 'order': 1 } } // On trie les modules par leur ordre
        });

        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée" });
        }

        res.status(200).json(formation.modules);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const reorderModulesInFormation = async (req, res) => {
    try {
        const { modules } = req.body; // On utilise 'modules' pour matcher le front
        const { id } = req.params;

        if (!modules || !Array.isArray(modules)) {
            return res.status(400).json({ message: "Le tableau de modules est requis." });
        }

        // 1. Mise à jour du tableau d'IDs dans la Formation
        await Formation.findByIdAndUpdate(id, { $set: { modules: modules } });

        // 2. Mise à jour du champ 'order' dans chaque document Module
        // C'est ce qui empêche le bug du refresh !
        const updatePromises = modules.map((moduleId, index) => {
            return Module.findByIdAndUpdate(moduleId, { order: index });
        });
        await Promise.all(updatePromises);

        res.status(200).json({ message: "Ordre des modules mis à jour avec succès", modules });
    } catch (error) {
        console.error("Erreur reorderModules:", error);
        res.status(400).json({ message: error.message });
    }
};

export const savePositioningTest = async (req, res) => {
    try {
        const formationId = req.params.id;
        // On récupère les données et on ajoute une date de mise à jour
        const testData = {
            ...req.body,
            updatedAt: new Date()
        };

        const formation = await Formation.findByIdAndUpdate(
            formationId,
            { $set: { positioningTest: testData } }, // On utilise $set pour être précis
            { new: true, runValidators: false } // On désactive temporairement les validateurs si le schéma est en transition
        );

        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée" });
        }

        console.log(`✅ Test de positionnement mis à jour pour: ${formation.title}`);
        res.status(200).json(formation.positioningTest);
    } catch (error) {
        console.error("❌ Erreur sauvegarde test:", error);
        res.status(500).json({ message: "Erreur lors de la sauvegarde du test", error: error.message });
    }
};

export const getPositioningTest = async (req, res) => {
    try {
        const { id } = req.params;
        const formation = await Formation.findById(id);
        
        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée" });
        }

        // On renvoie directement l'objet imbriqué
        res.status(200).json(formation.positioningTest || { text: '', questions: [] });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export const getEvaluationStats = async (req, res) => {
  try {
    const { formationId, type } = req.params; 

    const results = await Result.find({ formation: formationId, type: type });

    if (!results || results.length === 0) {
      return res.status(200).json({ stats: [] });
    }

    const categoryStats = {};

    results.forEach(result => {
      result.answers.forEach(answer => {
        const cat = answer.category || "Général";
        
        if (!categoryStats[cat]) {
          categoryStats[cat] = { totalPoints: 0, earnedPoints: 0, count: 0 };
        }

        categoryStats[cat].earnedPoints += answer.score; 
        categoryStats[cat].totalPoints += answer.maxPoints;
        categoryStats[cat].count += 1;
      });
    });

    const formattedData = Object.keys(categoryStats).map(key => ({
      category: key,
      percentage: Math.round((categoryStats[key].earnedPoints / categoryStats[key].totalPoints) * 100)
    }));

    res.status(200).json({ stats: formattedData });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error });
  }
};