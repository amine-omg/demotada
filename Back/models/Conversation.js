import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // Optionnel : un titre pour les conversations de groupe
  title: {
    type: String,
    trim: true
  },
  lastMessageAt: { // Pour trier les conversations par la plus récente
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

// La ligne manquante était probablement celle-ci :
export default Conversation;
