import mongoose from 'mongoose';

const tableStructureSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  
  // La clé dans ton JSON de data qui contient le tableau (ex: "items")
  dataKey: { type: String, required: true, default: 'items' },

  // Définition de la zone de répétition
  region: {
    startX: { type: Number, required: true },
    startY: { type: Number, required: true },
    width: { type: Number, required: true },
    rowHeight: { type: Number, required: true }, // Hauteur d'une ligne
    maxRowsPerPage: { type: Number, default: 10 }
  },

  // Définition des colonnes à l'intérieur du tableau
  columns: [{
    key: { type: String }, // ex: "description", "quantity", "price"
    label: { type: String }, // ex: "Désignation"
    relativeX: { type: Number }, // Position X relative au début du tableau
    width: { type: Number },
    align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    styling: {
      fontSize: { type: Number, default: 10 },
      fontWeight: { type: String, default: 'normal' }
    }
  }],

  showFooter: { type: Boolean, default: true }, // Pour les totaux en bas de tableau
  footerStyles: {
    fontFamily: { type: String },
    color: { type: String }
  }
}, { timestamps: true });

const TableStructure = mongoose.model('TableStructure', tableStructureSchema);
export default TableStructure;