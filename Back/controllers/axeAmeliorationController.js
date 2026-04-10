import AxeAmelioration from '../models/AxeAmelioration.js';

export const createAxe = async (req, res) => {
  try {
    const { titre, description } = req.body;
    if (!titre) return res.status(400).json({ message: 'Le titre est requis.' });

    const newAxe = new AxeAmelioration({
      tenant: req.tenant ? req.tenant._id : undefined,
      titre,
      description,
      createur: req.user._id
    });

    const savedAxe = await newAxe.save();
    res.status(201).json(savedAxe);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const getAxes = async (req, res) => {
  try {
    const query = {};
    if (req.tenant) query.tenant = req.tenant._id;

    const axes = await AxeAmelioration.find(query)
      .populate('createur', 'prenom nom')
      .sort({ createdAt: -1 });

    res.status(200).json(axes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};