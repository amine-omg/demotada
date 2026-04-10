import Entity from '../models/Entity.js'; // Assurez-vous d'avoir ce modèle

// @desc    Crée une nouvelle entité
// @route   POST /api/entities
// @access  Private (Admin, etc.)
export const createEntity = async (req, res) => {
    try {
        const { name, type, logo, numeroTVA, numeroSIRET, numeroNAF } = req.body;
        const entity = new Entity({
            name,
            type,
            logo,
            numeroTVA,
            numeroSIRET,
            numeroNAF,
            // On pourrait lier le créateur ici
        });
        const createdEntity = await entity.save();
        res.status(201).json(createdEntity);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de l'entité", error: error.message });
    }
};

// @desc    Récupère toutes les entités
// @route   GET /api/entities
// @access  Private
export const getAllEntities = async (req, res) => {
    try {
        const entities = await Entity.find({});
        res.status(200).json(entities);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// @desc    Récupère une entité par son ID
// @route   GET /api/entities/:entityId
// @access  Private
export const getEntityById = async (req, res) => {
    try {
        const entity = await Entity.findById(req.params.entityId);
        if (!entity) {
            return res.status(404).json({ message: "Entité non trouvée" });
        }
        res.status(200).json(entity);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// @desc    Met à jour une entité
// @route   PUT /api/entities/:entityId
// @access  Private (Admin, propriétaire de l'entité)
export const updateEntity = async (req, res) => {
    try {
        const entity = await Entity.findByIdAndUpdate(req.params.entityId, req.body, { new: true });
        if (!entity) {
            return res.status(404).json({ message: "Entité non trouvée" });
        }
        res.status(200).json(entity);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'entité", error: error.message });
    }
};
