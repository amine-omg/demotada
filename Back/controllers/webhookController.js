import Webhook from '../models/Webhook.js';
import axios from 'axios';
import crypto from 'crypto';

// Enregistrer un nouveau Webhook (ex: l'URL d'un Zapier ou d'un serveur client)
export const createWebhook = async (req, res) => {
    try {
        const { tenantId, targetUrl, events, secret } = req.body;

        const webhook = new Webhook({
            tenantId,
            targetUrl,
            events: events || ['document.completed'], // ex: 'document.signed', 'document.error'
            secret: secret || crypto.randomBytes(32).toString('hex'), // Pour signer les payloads
            isActive: true
        });

        await webhook.save();
        res.status(201).json({ message: "Webhook configuré avec succès.", webhook });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Fonction interne pour déclencher un Webhook (à appeler dans ton moteur de rendu)
export const triggerWebhook = async (tenantId, event, payload) => {
    const webhooks = await Webhook.find({ tenantId, events: event, isActive: true });

    for (const hook of webhooks) {
        // Signature HMAC pour que le client vérifie que ça vient bien de Kernain
        const signature = crypto
            .createHmac('sha256', hook.secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        try {
            await axios.post(hook.targetUrl, payload, {
                headers: { 
                    'X-Kernain-Event': event,
                    'X-Kernain-Signature': signature 
                }
            });
        } catch (error) {
            console.error(`Échec du Webhook pour ${hook.targetUrl}:`, error.message);
            // Optionnel : Log de l'échec pour retry plus tard
        }
    }
};

export const getWebhooksByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const hooks = await Webhook.find({ tenantId });
        res.status(200).json(hooks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};