import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // Peut être lié à une enveloppe entière ou à un document spécifique
  envelopeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Envelope', required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  
  // L'auteur peut être un User (ton client) ou un Signer (l'invité externe)
  authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  authorModel: { type: String, enum: ['User', 'Signer'], required: true },
  
  content: { type: String, required: true, trim: true },
  
  // Pour permettre de répondre à un commentaire (Thread)
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },

  // Localisation optionnelle sur le PDF (pour pointer une clause précise)
  position: {
    page: Number,
    x: Number,
    y: Number
  },

  isResolved: { type: Boolean, default: false } // Pour marquer une négociation comme finie
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;