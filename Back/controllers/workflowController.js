import WorkflowStep from '../models/WorkflowStep.js';

// Définir une étape de signature pour une enveloppe
export const createWorkflowStep = async (req, res) => {
    try {
        const { envelopeId, order, role, requiredAction } = req.body;

        const step = new WorkflowStep({
            envelopeId,
            order, // ex: 1, 2, 3
            role,  // ex: 'signer', 'approver', 'viewer'
            requiredAction, // 'sign', 'approve', 'cc'
            status: 'pending'
        });

        await step.save();
        res.status(201).json(step);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer l'ordre du workflow pour une enveloppe
export const getEnvelopeWorkflow = async (req, res) => {
    try {
        const { envelopeId } = req.params;
        const steps = await WorkflowStep.find({ envelopeId }).sort({ order: 1 });
        res.status(200).json(steps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};