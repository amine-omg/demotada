// backend/controllers/documentController.js
import Document from '../models/Document.js';
import User from '../models/User.js';

/**
 * @desc    Crée un nouveau document.
 * @route   POST /api/documents
 * @access  Private (Admin, Formateur, ou rôle spécifique pour certains types)
 */
export const createDocument = async (req, res) => {
  try {
    const { title, description, type, fileUrl, session, formation, dueDate, issueDate, relatedToUser, isValidated, templateId } = req.body;
    const createdBy = req.user.id; // L'utilisateur authentifié

    if (!title || !type || !fileUrl) {
      return res.status(400).json({ message: "Le titre, le type et l'URL du fichier sont requis." });
    }

    // Vérification de la session/formation si fournie
    if (session) {
      const existingSession = await Session.findById(session);
      if (!existingSession) return res.status(404).json({ message: "Session non trouvée." });
    }
    if (formation) {
      const existingFormation = await Formation.findById(formation);
      if (!existingFormation) return res.status(404).json({ message: "Formation non trouvée." });
    }

    const newDocument = new Document({
      title,
      description,
      type,
      fileUrl,
      session,
      formation,
      createdBy,
      dueDate: type === 'devoir' ? dueDate : null,
      issueDate: (type === 'attestation' || type === 'diplome') ? issueDate : null,
      relatedToUser: (type === 'attestation' || type === 'diplome') ? relatedToUser : null,
      isValidated,
      templateId,
    });

    const savedDocument = await newDocument.save();
    res.status(201).json(savedDocument);

  } catch (error) {
    console.error("Erreur dans createDocument:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du document", error: error.message });
  }
};

/**
 * @desc    Récupère les documents filtrés par session, formation, type, ou utilisateur lié.
 * @route   GET /api/documents?sessionId=...&type=...&relatedToUser=...
 * @access  Private (Tous les utilisateurs authentifiés, mais les autorisations fines seront gérées)
 */
export const getDocuments = async (req, res) => {
  try {
    // CORRECTION ICI : Suppression de ': any'
    const filter = {}; // Ligne 63

    const { sessionId, formationId, type, relatedToUser, createdBy } = req.query;

    if (sessionId) filter.session = sessionId;
    if (formationId) filter.formation = formationId;
    if (type) filter.type = type; // 'devoir', 'attestation', 'diplome'
    if (relatedToUser) filter.relatedToUser = relatedToUser; // Pour les documents spécifiques à un utilisateur
    if (createdBy) filter.createdBy = createdBy; // Documents créés par un utilisateur spécifique

    // Implémenter ici la logique d'autorisation si nécessaire:
    // Par exemple, un apprenant ne voit que ses attestations ou les devoirs de sa session.
    // Un formateur voit tous les documents de ses sessions/formations.
    // Pour l'instant, on se contente de filtrer.

    const documents = await Document.find(filter)
      .populate('createdBy', 'nom prenom photo')
      .populate('session', 'title') // Peupler le titre de la session
      .populate('formation', 'title') // Peupler le titre de la formation
      .populate('relatedToUser', 'nom prenom'); // Peupler l'utilisateur lié

    res.status(200).json(documents);
  } catch (error) {
    console.error("Erreur dans getDocuments:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des documents", error: error.message });
  }
};

/**
 * @desc    Récupère un document par son ID.
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'nom prenom photo')
      .populate('session', 'title')
      .populate('formation', 'title')
      .populate('relatedToUser', 'nom prenom');

    if (!document) {
      return res.status(404).json({ message: "Document non trouvé." });
    }
    // Ajoutez ici des vérifications d'autorisation si l'utilisateur peut accéder à ce document
    res.status(200).json(document);
  } catch (error) {
    console.error("Erreur dans getDocumentById:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { id: documentId } = req.params; // L'ID du document de devoir
    const { submissionUrl } = req.body; // L'URL du fichier rendu par l'élève
    const submittedBy = req.user.id; // L'ID de l'utilisateur authentifié (l'élève)

    if (!submissionUrl) {
      return res.status(400).json({ message: "L'URL du devoir soumis est requise." });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Devoir non trouvé." });
    }

    // Vérifier que c'est bien un devoir
    if (document.type !== 'devoir') {
      return res.status(400).json({ message: "Ce document n'est pas un devoir." });
    }

    // Vérifier si l'utilisateur est bien un apprenant et s'il est inscrit à la session du devoir
    // Pour une vérification plus robuste, assurez-vous que l'apprenant est bien lié à cette session.
    // Pour l'instant, on se base sur le rôle d'apprenant.
    if (req.user.role !== 'apprenant') {
        return res.status(403).json({ message: "Non autorisé à soumettre ce devoir." });
    }

    // Mettre à jour le document avec les informations de soumission
    document.isSubmitted = true;
    document.submissionUrl = submissionUrl;
    document.submittedBy = submittedBy; // L'ID de l'apprenant qui a soumis
    document.submissionDate = new Date(); // Date de la soumission

    const updatedDocument = await document.save();

    res.status(200).json(updatedDocument);

  } catch (error) {
    console.error("Erreur dans submitAssignment:", error);
    res.status(500).json({ message: "Erreur serveur lors de la soumission du devoir.", error: error.message });
  }
};

/**
 * @desc    Met à jour un document existant.
 * @route   PUT /api/documents/:id
 * @access  Private (Admin, Formateur, ou créateur du document)
 */
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'nom prenom photo')
      .populate('session', 'title')
      .populate('formation', 'title')
      .populate('relatedToUser', 'nom prenom');

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document non trouvé." });
    }
    // Vérification d'autorisation: seul l'admin/formateur ou le créateur peut modifier
    if (req.user.role !== 'admin' && req.user.role !== 'formateur' && updatedDocument.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé à modifier ce document." });
    }

    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error("Erreur dans updateDocument:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du document", error: error.message });
  }
};

/**
 * @desc    Supprime un document.
 * @route   DELETE /api/documents/:id
 * @access  Private (Admin, Formateur, ou créateur du document)
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document non trouvé." });
    }
    // Vérification d'autorisation
    if (req.user.role !== 'admin' && req.user.role !== 'formateur' && document.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé à supprimer ce document." });
    }

    await document.deleteOne();
    res.status(200).json({ message: "Document supprimé avec succès." });
  } catch (error) {
    console.error("Erreur dans deleteDocument:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du document", error: error.message });
  }
};
