import BulkSend from '../models/BulkSend.js';
import { triggerDocumentGeneration } from '../services/generatorService.js'; // Service à créer

export const createBulkTask = async (req, res) => {
    try {
        const { tenantId, templateId, recipients, globalMetadata } = req.body;

        const bulkTask = new BulkSend({
            tenantId,
            templateId,
            totalCount: recipients.length,
            status: 'pending',
            metadata: globalMetadata
        });

        await bulkTask.save();

        // On lance le processus en arrière-plan (Worker ou boucle asynchrone)
        // Note : En production, on utiliserait une file d'attente (Redis/BullMQ)
        processBulk(bulkTask._id, recipients);

        res.status(202).json({
            message: "Envoi massif initialisé.",
            taskId: bulkTask._id,
            estimatedCount: recipients.length
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getBulkStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await BulkSend.findById(id);
        
        const progress = {
            percentage: (task.successCount + task.errorCount) / task.totalCount * 100,
            success: task.successCount,
            errors: task.errorCount,
            status: task.status
        };

        res.status(200).json({ task, progress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logique simplifiée de traitement
async function processBulk(taskId, recipients) {
    const task = await BulkSend.findById(taskId);
    task.status = 'processing';
    await task.save();

    for (const recipient of recipients) {
        try {
            // Appel au moteur Kernain pour chaque destinataire
            await triggerDocumentGeneration(task.templateId, recipient);
            task.successCount += 1;
        } catch (err) {
            task.errorCount += 1;
            task.errors.push({ recipient: recipient.email, message: err.message });
        }
        await task.save();
    }

    task.status = 'completed';
    task.completedAt = Date.now();
    await task.save();
}