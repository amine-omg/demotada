// backend/controllers/categoryController.js
import Category from '../models/Category.js';

/**
 * @desc    Crée une nouvelle catégorie
 * @route   POST /api/categories
 * @access  Private (Admin, Instructor)
 */
export const createCategory = async (req, res) => {
    try {
        const { name, description, tenantId, color, icon } = req.body;
        const createdByUserId = req.user && req.user.id ? req.user.id : null;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
        }

        // On vérifie l'existence par nom ET par tenant pour permettre 
        // à deux clients différents d'avoir une catégorie "Factures"
        const existingCategory = await Category.findOne({ 
            name, 
            tenantId: tenantId || req.user.tenantId 
        });
        
        if (existingCategory) {
            return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà pour ce client.' });
        }

        const newCategory = new Category({
            name,
            description: description || '',
            createdBy: createdByUserId,
            tenantId: tenantId || req.user.tenantId, // Ajout pour Module 4
            color: color || '#3b82f6', // Valeur par défaut
            icon: icon || 'folder'
        });

        const createdCategory = await newCategory.save();
        res.status(201).json(createdCategory);

    } catch (error) {
        console.error("Erreur lors de la création de la catégorie :", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        res.status(500).json({ message: 'Erreur serveur lors de la création de la catégorie', error: error.message });
    }
};

/**
 * @desc    Récupère les catégories (filtrées par tenant/école)
 * @route   GET /api/categories
 * @access  Private
 */
export const getCategories = async (req, res) => {
    try {
        const { createdBy, ecoleId, tenantId } = req.query;
        let filter = {};

        // Logique de filtrage Module 4 + ta logique initiale
        const targetTenant = tenantId || ecoleId;

        if (targetTenant) {
            // Si un ID spécifique est fourni (Admin view)
            filter.$or = [{ tenantId: targetTenant }, { ecole: targetTenant }];
        } else if (createdBy) {
            filter.createdBy = createdBy;
        } else {
            // Sécurité Multi-tenant par défaut
            if (req.user && req.user.role !== 'admin') {
                if ((req.user.role === 'ecole' || req.user.role === 'owner') && req.user.associatedEntity) {
                    filter.$or = [
                        { tenantId: req.user.tenantId },
                        { ecole: req.user.associatedEntity }
                    ];
                } else {
                    filter.createdBy = req.user.id;
                }
            }
        }

        // On inclut toujours les catégories "système" par défaut si elles existent
        // filter.$or = (filter.$or || []).concat([{ isDefault: true }]);

        const categories = await Category.find(filter).sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
        res.status(500).json({ message: 'Erreur serveur...', error: error.message });
    }
};

/**
 * @desc    Récupère une catégorie par son ID
 */
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id)
            .populate('createdBy', 'nom prenom')
            .populate('formations', 'title description image status');

        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie par ID :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

/**
 * @desc    Mettre à jour une catégorie
 */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon } = req.body;

        const updateData = { modifiedAt: new Date() };
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (color !== undefined) updateData.color = color;
        if (icon !== undefined) updateData.icon = icon;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la catégorie :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

/**
 * @desc    Supprimer une catégorie
 */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        // Désolidariser les formations liées
        await Formation.updateMany(
            { category: id },
            { $set: { category: null } }
        );

        res.status(200).json({ message: 'Catégorie supprimée avec succès et formations déliées.' });
    } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};