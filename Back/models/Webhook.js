import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  url: { type: String, required: true }, // L'URL de destination du client
  
  events: [{ 
    type: String, 
    enum: ['document.created', 'document.signed', 'invoice.paid', 'scan.completed'] 
  }],

  secret: { type: String, required: true }, // Pour que le client vérifie que ça vient bien de Kernain (HMAC)
  isActive: { type: Boolean, default: true },
  
  // Pour le retry en cas d'échec du serveur client
  retryConfig: {
    attempts: { type: Number, default: 3 },
    lastAttemptAt: { type: Date }
  }
}, { timestamps: true });

const Webhook = mongoose.model('Webhook', webhookSchema);
export default Webhook;