// backend/models/GeneratedArtifact.js
import mongoose from 'mongoose';

const artifactSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessingJob' },
  fileUrl: String, // Lien vers S3/Azure Blob
  fileType: String,
  creditsConsumed: Number,
  expiresAt: Date // On supprime le fichier après 24h ou 7 jours
}, { timestamps: true });

export default mongoose.model('GeneratedArtifact', artifactSchema);