import AliasMap from '../models/AliasMap.js';

// @desc    Ajouter un nouvel alias à un dictionnaire
// @route   POST /api/alias-maps
export const createAlias = async (req, res) => {
    try {
        const { organizationId, category, internalKey, aliases } = req.body;

        const newAlias = await AliasMap.create({
            organizationId,
            category,     // ex: 'identity', 'billing'
            internalKey,  // ex: 'last_name'
            aliases       // ex: ['Nom', 'Nom de famille', 'Client']
        });

        res.status(201).json(newAlias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mettre à jour les synonymes d'une clé
// @route   PUT /api/alias-maps/:id
export const updateAlias = async (req, res) => {
    try {
        const updated = await AliasMap.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer le dictionnaire d'une organisation
// @route   GET /api/alias-maps/org/:orgId
export const getOrgAliases = async (req, res) => {
    try {
        const maps = await AliasMap.find({ organizationId: req.params.orgId });
        res.json(maps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// On ajoute ça à ton aliasMapController.js existant
// On ajoute ça à ton aliasMapController.js existant

export const identifyFieldsFromOcr = async (templateId, ocrBlocks) => {
    // 1. Récupérer le dictionnaire de l'organisation
    const dictionary = await AliasMap.find({ organizationId: '...' });

    const detectedMappings = [];

    // 2. Pour chaque bloc de texte trouvé par l'OCR
    for (const block of ocrBlocks) {
        // block = { text: "Facture n°", x: 10, y: 20... }
        
        // On cherche si le texte du bloc existe dans nos alias
        const foundAlias = dictionary.find(a => 
            a.aliases.some(alias => block.text.toLowerCase().includes(alias.toLowerCase()))
        );

        if (foundAlias) {
            detectedMappings.push({
                key: foundAlias.internalKey,
                confidence: 0.95,
                coordinates: { x: block.x, y: block.y, w: block.w, h: block.h },
                originalText: block.text
            });
        }
    }
    
    return detectedMappings;
};