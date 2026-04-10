import Plan from '../models/Plan.js';

// Créer un nouveau forfait (Admin Kernain uniquement)
export const createPlan = async (req, res) => {
    try {
        const { name, price, stripePriceId, features, quotas } = req.body;

        const plan = new Plan({
            name,
            price,
            stripePriceId, // ID lié à ton dashboard Stripe
            features,      // ex: ['signature_electronique', 'hubspot_iframe']
            quotas: {
                monthlyDocuments: quotas.docs || 50,
                storageLimitGB: quotas.storage || 5
            }
        });

        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer la liste des offres pour la page "Pricing"
export const getActivePlans = async (req, res) => {
    try {
        const plans = await Plan.find({ active: true }).sort({ price: 1 });
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};