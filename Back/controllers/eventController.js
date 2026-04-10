import Event from '../models/Event.js';

// @desc    Crée un nouvel événement
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    const { title, description, start, end, allDay, participants, color } = req.body;

    const newEvent = new Event({
      title,
      description,
      start,
      end,
      allDay,
      participants,
      color,
      createdBy: req.user.id, // L'ID de l'utilisateur vient du middleware
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'événement', error: error.message });
  }
};

// @desc    Récupère les événements pour l'utilisateur connecté
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    // Récupère les événements où l'utilisateur est soit le créateur, soit un participant
    const events = await Event.find({
      $or: [{ createdBy: req.user.id }, { participants: req.user.id }],
    }).populate('createdBy', 'nom prenom').populate('participants', 'nom prenom');

    res.status(200).json(events);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Met à jour un événement
// @route   PUT /api/events/:eventId
// @access  Private
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Vérifier si l'utilisateur est le créateur de l'événement
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    Object.assign(event, req.body);
    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprime un événement
// @route   DELETE /api/events/:eventId
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    await event.deleteOne(); // Utilise deleteOne() qui est la méthode moderne
    res.status(200).json({ message: 'Événement supprimé avec succès' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
