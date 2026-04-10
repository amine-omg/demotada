import Subscription from '../models/Subscription.js';

// Souscrire à un plan (Lien avec Stripe)
export const subscribeToPlan = async (req, res) => {
    try {
        const { tenantId, planId, stripeSubscriptionId } = req.body;

        const subscription = await Subscription.findOneAndUpdate(
            { tenantId },
            { 
                planId, 
                stripeSubscriptionId, 
                status: 'active',
                startDate: Date.now() 
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: "Abonnement activé.", subscription });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Vérifier les quotas avant une action (ex: avant de générer un PDF)
export const checkUsageQuota = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const sub = await Subscription.findOne({ tenantId }).populate('planId');
        
        // Ici tu comparerais sub.currentUsage avec sub.planId.quotas
        const hasQuota = sub.currentUsage < sub.planId.quotas.monthlyDocuments;

        res.status(200).json({ canProceed: hasQuota, remaining: sub.planId.quotas.monthlyDocuments - sub.currentUsage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};