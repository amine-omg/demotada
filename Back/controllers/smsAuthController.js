import SmsAuth from '../models/SmsAuth.js';
// Ici tu intégreras un service comme Twilio ou Vonage

export const sendOTP = async (req, res) => {
    try {
        const { signerId, phoneNumber } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const smsEntry = await SmsAuth.findOneAndUpdate(
            { signerId },
            { 
                code, 
                phoneNumber, 
                expiresAt: new Date(Date.now() + 10 * 60000), // Valide 10 min
                attempts: 0 
            },
            { upsert: true, new: true }
        );

        // Simulation d'envoi SMS
        console.log(`[SMS OTP] Envoi du code ${code} au ${phoneNumber}`);

        res.status(200).json({ message: "Code envoyé." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { signerId, code } = req.body;
        const auth = await SmsAuth.findOne({ signerId });

        if (!auth || auth.code !== code || auth.expiresAt < Date.now()) {
            return res.status(400).json({ error: "Code invalide ou expiré." });
        }

        res.status(200).json({ success: true, message: "Identité vérifiée." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};