import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  // Pour permettre des sous-dossiers (arborescence)
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  
  // Type de contenu rangé ici
  targetType: { type: String, enum: ['template', 'document'], default: 'template' },
  
  color: { type: String, default: '#4A90E2' }, // Pour l'UI
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Folder = mongoose.model('Folder', folderSchema);
export default Folder;