import mongoose from 'mongoose';

const VectorGraphicSchema = new mongoose.Schema({
  templateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Template', 
    required: true 
  },
  pageNumber: { 
    type: Number, 
    required: true 
  },
  
  // On simplifie drastiquement : c'est soit une image remplaçable, soit une zone vide (cadre)
  type: { 
    type: String, 
    enum: ['image', 'zone'], 
    required: true 
  },

  // LE COEUR DU SYSTÈME : La boîte de délimitation (Bounding Box)
  // Ces coordonnées permettront au Front de placer un bouton "Remplacer" pile au bon endroit
  boundingBox: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },

  // --- NOUVEAUX CHAMPS "TEMPLATE DYNAMIQUE" ---
  
  // Nom généré (ex: "Image_1", "Cadre_Signature") pour que l'utilisateur s'y retrouve
  name: { 
    type: String 
  },

  // Si c'est une image, on peut stocker son URL extraite pour la prévisualiser
  originalImageUrl: { 
    type: String 
  },

  // Est-ce que cette zone est modifiable par l'utilisateur final ?
  isEditable: { 
    type: Boolean, 
    default: true 
  }

}, { timestamps: true });

// Indexation pour charger la page super vite sur le Front
VectorGraphicSchema.index({ templateId: 1, pageNumber: 1 });

const VectorGraphic = mongoose.model('VectorGraphic', VectorGraphicSchema);

export default VectorGraphic;