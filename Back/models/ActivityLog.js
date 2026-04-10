// backend/models/ActivityLog.js
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // NOUVEAU CHAMP : Durée de la session en secondes
  durationInSeconds: { 
    type: Number,
    default: 0 
  },
}, { timestamps: true });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;