// backend/models/WorkflowStep.js
import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema({
  envelopeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Envelope',
    required: true
  },
  signerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signer',
    required: true
  },
  // L'ordre de passage (ex: 1, 2, 3...)
  order: { 
    type: Number, 
    default: 1 
  },
  // État de cette étape précise
  status: {
    type: String,
    enum: ['waiting', 'current', 'completed', 'skipped', 'declined'],
    default: 'waiting'
  },
  // Action requise à cette étape
  actionRequired: {
    type: String,
    enum: ['sign', 'approve', 'view', 'cc'],
    default: 'sign'
  },
  completedAt: { type: Date }
}, { timestamps: true });

// Index pour récupérer rapidement les étapes dans l'ordre pour une enveloppe
workflowStepSchema.index({ envelopeId: 1, order: 1 });

const WorkflowStep = mongoose.model('WorkflowStep', workflowStepSchema);
export default WorkflowStep;