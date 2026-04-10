import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
    unique: true
  },

  // 1. SIGNATURE TECHNIQUE (Directement du CSV)
  fileInfo: {
    checksum: { type: String }, // Le MD5 du scan
    filesize: { type: String }, // ex: "206 kB"
    mimetype: { type: String, default: 'application/pdf' },
    pdfVersion: { type: String }, // ex: "1.3"
    isLinearized: { type: Boolean, default: false }, // "Fast Web View"
    pageCount: { type: Number, default: 1 },
    pageLayout: { type: String } // ex: "OneColumn"
  },

  // 2. ADN DE CRÉATION
  sourceMetadata: {
    producer: { type: String }, // ex: "jsPDF 4.2.0"
    creator: { type: String },
    createDate: { type: Date },
    modifyDate: { type: Date },
    isTagged: { type: Boolean, default: false },
    hasJavascript: { type: Boolean, default: false }
  },

  // 3. GÉOMÉTRIE DE PRÉCISION
  pages: [{
    pageNumber: { type: Number },
    pageSize: { type: String }, // ex: "595.28 x 841.89 pts (A4)"
    width: { type: Number },    // mm
    height: { type: Number },   // mm
    rotation: { type: Number, default: 0 },
    userUnit: { type: Number, default: 1 } // Pour les formats géants
  }],

  // 4. ANALYSE DES POLICES (Extraction profonde du CSV)
  fonts: [{
    objectId: { type: Number },
    name: { type: String },     // ex: "Helvetica"
    type: { type: String },     // ex: "Type1"
    encoding: { type: String }, // ex: "WinAnsiEncoding"
    isEmbedded: { type: Boolean },
    isSubset: { type: Boolean },
    hasUnicode: { type: Boolean }
  }],

  // 5. ANALYSE DES IMAGES (Le coeur du scan Cambioli)
  images: [{
    imageNumber: { type: Number },
    pageNumber: { type: Number },
    type: { type: String },      // image, smask (masque de transparence)
    width: { type: Number },     // pixels
    height: { type: Number },    // pixels
    colorSpace: { type: String }, // RGB, Gray, CMYK
    bitsPerComponent: { type: Number },
    xPpi: { type: Number },      // Résolution horizontale
    yPpi: { type: Number },      // Résolution verticale
    objectId: { type: Number }
  }]

}, { timestamps: true });

const Metadata = mongoose.model('Metadata', metadataSchema);
export default Metadata;