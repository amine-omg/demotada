// backend/models/Notification.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
  recipient: { // L'utilisateur qui reçoit la notification
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Pour des requêtes rapides par destinataire
  },
  sender: { // L'utilisateur qui a déclenché la notification (optionnel, ex: pour un message)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Peut être null si la notification vient du système
  },
  type: { // Type de notification (ex: 'new_message', 'formation_approved', 'quiz_graded', 'new_reply_forum')
    type: String,
    required: true,
    enum: [
      'new_message',
      'formation_approved',
      'formation_rejected',
      'quiz_graded',
      'new_reply_forum',
      'new_sujet_forum',
      'session_update',
      'session_cancellation',
      'enrollment_request',
      'enrollment_approved',
      'enrollment_rejected',
      'system_alert'
    ]
  },
  message: { // Le contenu du message de la notification
    type: String,
    required: true,
    trim: true
  },
  link: { // Un lien vers la ressource associée à la notification (ex: /chat/conversationId, /formations/id)
    type: String,
    default: null
  },
  read: { // Statut de lecture de la notification
    type: Boolean,
    default: false
  },
  // Vous pouvez ajouter des champs supplémentaires spécifiques au contexte si nécessaire
  // contextId: { type: mongoose.Schema.Types.ObjectId }, // ID de l'objet lié (formation, quiz, etc.)
  // contextType: { type: String }, // Type de l'objet lié

}, { timestamps: true }); // Ajoute createdAt et updatedAt

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
