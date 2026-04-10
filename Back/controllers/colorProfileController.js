// backend/controllers/colorProfileController.js
import ColorProfile from '../models/ColorProfile.js';

export const upsertColorProfile = async (req, res) => {
  try {
    const { templateId, targetSpace, brandPalette, outputSettings } = req.body;

    const profile = await ColorProfile.findOneAndUpdate(
      { templateId },
      { targetSpace, brandPalette, outputSettings },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Profil colorimétrique d'impression configuré.",
      profile
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getProfileByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const profile = await ColorProfile.findOne({ templateId });
    if (!profile) return res.status(404).json({ message: "Profil couleur standard (sRGB)." });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};