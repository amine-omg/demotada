import Opportunity from '../models/Opportunity.js';

export const createOpportunity = async (req, res) => {
    try {
        const { tenantId, contactId, title, amount, closeDate } = req.body;

        const opportunity = new Opportunity({
            tenantId,
            contactId,
            title,
            amount,
            closeDate,
            stage: 'proposal_sent'
        });

        await opportunity.save();
        res.status(201).json(opportunity);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getOpportunitiesByContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const opportunities = await Opportunity.find({ contactId });
        res.status(200).json(opportunities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};