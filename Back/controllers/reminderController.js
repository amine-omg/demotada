import Reminder from '../models/Reminder.js';

// Créer une règle de relance pour un document spécifique
export const createReminder = async (req, res) => {
    try {
        const { 
            documentId, 
            tenantId, 
            recipientEmail, 
            frequency, // en jours, ex: tous les 2 jours
            maxAttempts, 
            messageCustom 
        } = req.body;

        const reminder = new Reminder({
            documentId,
            tenantId,
            recipientEmail,
            frequency: frequency || 3,
            maxAttempts: maxAttempts || 5,
            messageCustom,
            nextRun: new Date(Date.now() + (frequency || 3) * 24 * 60 * 60 * 1000),
            status: 'active'
        });

        await reminder.save();
        res.status(201).json({ message: "Relance programmée avec succès.", reminder });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer les relances actives pour un client (Dashboard)
export const getActiveRemindersByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const reminders = await Reminder.find({ tenantId, status: 'active' })
            .populate('documentId', 'title');
        res.status(200).json(reminders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Désactiver une relance (ex: si le signataire a finalement signé ou appelé)
export const stopReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const reminder = await Reminder.findByIdAndUpdate(
            id, 
            { status: 'stopped', updatedAt: Date.now() }, 
            { new: true }
        );
        res.status(200).json({ message: "Relance interrompue.", reminder });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};