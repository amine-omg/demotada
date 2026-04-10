// backend/controllers/assignmentController.js
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Formation from '../models/Formation.js';

// Fonction utilitaire pour peupler les soumissions avec les détails de l'élève
const populateSubmissionDetails = async (submission) => {
    if (!submission) return submission;
    const submissionObject = submission.toObject ? submission.toObject() : submission;
    
    if (submissionObject.student) {
        const studentDetails = await User.findById(submissionObject.student).select('nom prenom email photo hasDisability').lean();
        submissionObject.student = studentDetails;
    }
    if (submissionObject.gradedBy) {
        const gradedByDetails = await User.findById(submissionObject.gradedBy).select('nom prenom email').lean();
        submissionObject.gradedBy = gradedByDetails;
    }
    return submissionObject;
};

/**
 * @desc Crée un nouveau devoir.
 * @route POST /api/assignments
 * @access Private (Admin, Formateur)
 */
export const createAssignment = async (req, res) => {
    try {
        const { title, description, fileUrl, session, formation, dueDate } = req.body;
        const createdBy = req.user.id; // Le formateur/admin qui crée le devoir

        if (!title || !fileUrl || !session || !formation || !dueDate) {
            return res.status(400).json({ message: "Le titre, l'URL du fichier, la session, la formation et la date d'échéance sont requis pour un devoir." });
        }

        // Vérifier si la session et la formation existent
        const existingSession = await Session.findById(session);
        if (!existingSession) return res.status(404).json({ message: "Session non trouvée." });
        const existingFormation = await Formation.findById(formation);
        if (!existingFormation) return res.status(404).json({ message: "Formation non trouvée." });

        // Vérifier les permissions (Admin ou Formateur)
        if (req.user.role !== 'admin' && req.user.role !== 'formateur') {
            return res.status(403).json({ message: "Non autorisé à créer un devoir." });
        }

        const newAssignment = new Assignment({
            title,
            description,
            fileUrl,
            session,
            formation,
            dueDate,
            createdBy,
            submissions: [] // Initialiser le tableau de soumissions vide
        });

        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);

    } catch (error) {
        console.error("Erreur dans createAssignment:", error);
        res.status(500).json({ message: "Erreur serveur lors de la création du devoir.", error: error.message });
    }
};

export const getAssignments = async (req, res) => {
  try {
    const filter = {};
    const { sessionId, formationId, createdBy } = req.query;
    const userId = req.user.id; // L'utilisateur qui fait la requête
    const userRole = req.user.role; // Le rôle de l'utilisateur

    if (sessionId) filter.session = sessionId;
    if (formationId) filter.formation = formationId;
    if (createdBy) filter.createdBy = createdBy;

    // Logique d'autorisation :
    // - Admin/Formateur : voient tous les devoirs de la session/formation
    // - Apprenant : voient seulement les devoirs de leurs sessions (peuvent les soumettre)
    if (userRole === 'apprenant') {
        // Pour les apprenants, on veut s'assurer qu'ils sont inscrits à la session
        const sessions = await Session.find({ 'elevesInscrits.userId': userId }).select('_id');
        const sessionIds = sessions.map(s => s._id);
        filter.session = { $in: sessionIds }; // Filtrer par les sessions de l'apprenant
    }


    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'nom prenom photo')
      // MODIFICATION ICI: Peupler les soumissions, et dans chaque soumission, peupler l'élève et celui qui a noté.
      .populate({
        path: 'submissions',
        populate: [
          { path: 'student', select: 'nom prenom photo' },
          { path: 'gradedBy', select: 'nom prenom' }
        ]
      })
      .sort
      ({ dueDate: 1, createdAt: 1 }); // Trier par date d'échéance

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Erreur dans getAssignments:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des devoirs", error: error.message });
  }
};


/**
 * @desc Récupère un devoir par son ID.
 * @route GET /api/assignments/:id
 * @access Private
 */
export const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('createdBy', 'nom prenom photo')
            .populate({
                path: 'submissions',
                populate: {
                    path: 'student gradedBy',
                    select: 'nom prenom email photo'
                }
            });

        if (!assignment) {
            return res.status(404).json({ message: "Devoir non trouvé." });
        }
        res.status(200).json(assignment);
    } catch (error) {
        console.error("Erreur dans getAssignmentById:", error);
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};

export const submitAssignment = async (req, res) => {
    try {
        const { id: assignmentId } = req.params;
        const { submissionUrl } = req.body;
        const studentId = req.user.id; // L'élève qui soumet

        if (!submissionUrl) {
            return res.status(400).json({ message: "L'URL du devoir soumis est requise." });
        }
        if (req.user.role !== 'apprenant') {
            return res.status(403).json({ message: "Non autorisé à soumettre un devoir." });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Devoir non trouvé." });
        }

        // Vérifier si une soumission existe déjà pour cet élève et ce devoir
        let submission = await Submission.findOne({ assignment: assignmentId, student: studentId });

        if (submission) {
            // Mise à jour de la soumission existante
            submission.submissionUrl = submissionUrl;
            submission.submissionDate = new Date(); // Mise à jour de la date de soumission
        } else {
            // Création d'une nouvelle soumission
            submission = new Submission({
                assignment: assignmentId,
                student: studentId,
                submissionUrl: submissionUrl,
                submissionDate: new Date(),
            });
        }

        const savedSubmission = await submission.save();

        // Mettre à jour le devoir pour y ajouter la référence de la soumission si elle n'y est pas
        if (!assignment.submissions.includes(savedSubmission._id)) {
            assignment.submissions.push(savedSubmission._id);
            await assignment.save();
        }
        
        // Peupler la soumission pour la renvoyer au frontend avec les détails de l'élève
        const populatedSubmission = await Submission.findById(savedSubmission._id)
                                                    .populate('student', 'nom prenom photo')
                                                    .populate('gradedBy', 'nom prenom');

        res.status(200).json(populatedSubmission); // Envoyer la soumission mise à jour/créée

    } catch (error) {
        console.error("Erreur dans submitAssignment:", error);
        res.status(500).json({ message: "Erreur serveur lors de la soumission du devoir.", error: error.message });
    }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submissionId, grade } = req.body; // submissionId est l'ID de la soumission spécifique à noter
    const gradedBy = req.user.id;

    if (!submissionId || grade === undefined || grade === null) {
      return res.status(400).json({ message: "L'ID de la soumission et la note sont requis." });
    }
    if (grade < 0 || grade > 100) {
      return res.status(400).json({ message: "La note doit être entre 0 et 100." });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'formateur') {
        return res.status(403).json({ message: "Non autorisé à noter ce devoir." });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
        return res.status(404).json({ message: "Soumission non trouvée." });
    }

    // S'assurer que la soumission appartient bien à cet assignmentId
    if (submission.assignment.toString() !== assignmentId) {
        return res.status(400).json({ message: "La soumission ne correspond pas au devoir spécifié." });
    }

    submission.grade = grade;
    submission.gradedBy = gradedBy;

    const updatedSubmission = await submission.save();

    // Re-peupler la soumission mise à jour pour la renvoyer au frontend
    const populatedSubmission = await Submission.findById(updatedSubmission._id)
                                                .populate('student', 'nom prenom photo')
                                                .populate('gradedBy', 'nom prenom');

    res.status(200).json(populatedSubmission);

  } catch (error) {
    console.error("Erreur dans gradeSubmission:", error);
    res.status(500).json({ message: "Erreur serveur lors de la notation de la soumission.", error: error.message });
  }
};
