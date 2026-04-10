import mongoose from 'mongoose';

const StorageProviderSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  providerType: { 
    type: String, 
    enum: ['google_drive', 'dropbox', 's3', 'onedrive', 'internal'], 
    default: 'internal' 
  },
  credentials: {
    accessToken: String,
    refreshToken: String,
    bucketName: String, // Pour S3
    rootFolderId: String // Pour Drive/Dropbox
  },
  syncSettings: {
    autoExport: { type: Boolean, default: true }, // Export auto dès que c'est signé
    namingConvention: { type: String, default: "{date}_{envelope_name}.pdf" }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const StorageProvider = mongoose.model('StorageProvider', StorageProviderSchema);
export default StorageProvider;