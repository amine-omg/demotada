import Prospect from '../models/Prospect.js';

export const createProspect = async (req, res) => {
    try {
        const { tenantId, email, source } = req.body; // source ex: 'LinkedIn', 'Formulaire Web'
        
        const prospect = new Prospect({
            tenantId,
            email,
            source,
            status: 'new'
        });

        await prospect.save();
        res.status(201).json(prospect);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProspectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'contacted', 'converted', 'junk'
        
        const prospect = await Prospect.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json(prospect);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};