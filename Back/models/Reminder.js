import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  envelopeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Envelope', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  isActive: { type: Boolean, default: true },
  
  // Configuration du cycle
  frequencyDays: { type: Number, default: 2 }, // Tous les X jours
  maxAttempts: { type: Number, default: 5 },   // Stop après X relances
  currentAttempts: { type: Number, default: 0 },
  
  lastSentAt: { type: Date },
  nextScheduledAt: { type: Date },

  // Personnalisation du message de relance
  customSubject: String,
  customBody: String
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;