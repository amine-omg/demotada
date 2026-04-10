const mongoose = require('mongoose');

const WorkflowStepSchema = new mongoose.Schema({
  envelopeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Envelope', required: true },
  order: { type: Number, required: true }, // 1, 2, 3... (les étapes de même niveau sont parallèles)
  actionType: { 
    type: String, 
    enum: ['SIGN', 'APPROVE', 'VIEW', 'RECEIVE_COPY'], 
    default: 'SIGN' 
  },
  // On peut assigner soit un signataire unique, soit un groupe
  signerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signer' },
  recipientsGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipientsGroup' },
  
  status: { 
    type: String, 
    enum: ['pending', 'current', 'completed', 'skipped', 'failed'], 
    default: 'pending' 
  },
  completedAt: { type: Date },
  conditions: {
    mustVerifyPhone: { type: Boolean, default: false },
    privateMessage: { type: String } // Message spécifique pour cette étape
  }
}, { timestamps: true });

const WorkflowStep = mongoose.model('WorkflowStep', WorkflowStepSchema);
export default WorkflowStep;