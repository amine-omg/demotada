// backend/controllers/logController.js

import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';

export const getUserLogs = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const logs = await ActivityLog.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    const stats = await ActivityLog.aggregate([
      { $match: { user: userId, action: 'logout' } },
      { $group: { _id: null, totalDuration: { $sum: '$durationInSeconds' } } }
    ]);

    const totalDurationInSeconds = stats.length > 0 ? stats[0].totalDuration : 0;
    const totalDurationInMinutes = Math.round(totalDurationInSeconds / 60);

    res.json({
      logs,
      stats: {
        totalDurationMinutes: totalDurationInMinutes
      }
    });
  } catch (error) {
      console.error("Erreur dans getUserLogs:", error)
      res.status(500).json({ message: 'Erreur serveur' });
  }
};