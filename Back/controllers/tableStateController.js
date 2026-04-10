// backend/controllers/tableStateController.js
import TableState from '../models/TableState.js';

// Récupérer les préférences de colonne/filtrage d'un utilisateur pour une table
export const getTableState = async (req, res) => {
  try {
    const { userId, tableId } = req.params;
    const state = await TableState.findOne({ userId, tableId });
    res.status(200).json(state || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour l'état de la table (ex: colonnes masquées, largeur, ordre)
export const updateTableState = async (req, res) => {
  try {
    const { userId, tableId, columns, filters, sorting } = req.body;

    const state = await TableState.findOneAndUpdate(
      { userId, tableId },
      { columns, filters, sorting },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "État de la table sauvegardé.",
      state
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};