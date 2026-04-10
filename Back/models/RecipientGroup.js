import mongoose from 'mongoose';

const RecipientsGroupSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  groupName: { type: String, required: true }, // ex: "Service RH", "DAF"
  members: [{
    email: { type: String, required: true },
    name: { type: String },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }
  }],
  signingRule: { 
    type: String, 
    enum: ['ANYONE_CAN_SIGN', 'ALL_MUST_SIGN'], 
    default: 'ANYONE_CAN_SIGN' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const RecipientsGroup = mongoose.model('RecipientsGroup', RecipientsGroupSchema);
export default RecipientsGroup;