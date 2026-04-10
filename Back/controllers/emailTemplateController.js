// backend/controllers/emailTemplateController.js
import asyncHandler from 'express-async-handler';
import EmailTemplate from '../models/EmailTemplate.js';

/**
 * @desc    Récupérer tous les templates d'email pour une école
 * @route   GET /api/email-templates
 * @access  Privé (Admin, Ecole)
 */
export const getEmailTemplatesForEcole = asyncHandler(async (req, res) => {
    const ecoleId = req.query.ecoleId || req.user.associatedEntity;
    
    if (!ecoleId) {
        res.status(400);
        throw new Error("Identifiant de l'école manquant.");
    }

    const templates = await EmailTemplate.find({ ecole: ecoleId }).sort({ nom: 1 });
    res.status(200).json(templates);
});


/**
 * @desc    Mettre à jour un template d'email
 * @route   PUT /api/email-templates/:id
 * @access  Privé (Admin, Ecole)
 */
export const updateEmailTemplate = asyncHandler(async (req, res) => {
    const { sujet, corps } = req.body;

    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
        res.status(404);
        throw new Error("Template d'email non trouvé.");
    }

    // Vérification des permissions : l'utilisateur doit être admin ou propriétaire du template
    const isOwner = template.ecole.toString() === req.user.associatedEntity?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
        res.status(403);
        throw new Error("Accès non autorisé à modifier ce template.");
    }

    // Mise à jour des champs modifiables
    template.sujet = sujet || template.sujet;
    template.corps = corps || template.corps;

    const updatedTemplate = await template.save();
    res.status(200).json(updatedTemplate);
});

export const seedDefaultTemplatesForEcole = asyncHandler(async (req, res) => {
    const { ecoleId } = req.body;

    if (!ecoleId) {
        res.status(400);
        throw new Error("L'ID de l'école est requis.");
    }

    // Vérifier si des templates par défaut existent déjà pour éviter les doublons
    const existingTemplates = await EmailTemplate.findOne({ ecole: ecoleId, isDefault: true });
    if (existingTemplates) {
        res.status(409); // 409 Conflict
        throw new Error("Les templates par défaut existent déjà pour cette école.");
    }

    // Appeler la méthode statique que nous avons déjà créée dans le modèle
    await EmailTemplate.createDefaultTemplatesForEcole(ecoleId);

    res.status(201).json({ message: "Les templates par défaut ont été créés avec succès pour l'école." });
});