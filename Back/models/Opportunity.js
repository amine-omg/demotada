// backend/models/Opportunite.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const opportuniteSchema = new Schema({
    // A quelle école appartient cette opportunité ?
    ecole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ecole',
        required: true
    },
    nomOpportunite: { type: String, required: true },
    // Le statut dans le pipeline (la colonne où se trouve la carte)
    currentStage: {
        type: String,
        required: true
    },
    apprenants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    prospects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prospect' }],
    formation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Formation'
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session' // Session de formation associée
    },
    // Le commercial ou créateur de l'opportunité
    proprietaire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activites: [{
    type: { type: String },
    title: { type: String },
    content: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String }
}],
    isCustomValue: { type: Boolean, default: false },
    typeBusiness: {
        type: String,
        enum: ['OpportunitéEntreprise', 'OpportunitéParticulier'],
        required: true
    },
    typeInterIntra: {
        type: String,
        enum: ['Inter', 'Intra']
    },
    // Le statut final de l'opportunité
    statutOpportunite: {
        type: String,
        enum: ['Indécis', 'Gagné', 'Perdu', 'Annulé'],
        default: 'Indécis'
    },
    lossReason: { type: String }, // Motif de la perte, choisi depuis CrmConfig
    dateCloture: { type: Date },
    // Valeur monétaire de l'opportunité (vu dans la maquette)
    valeur: {
        type: Number,
        default: 0
    }
}, { timestamps: { createdAt: 'dateCreation', updatedAt: 'modifiedAt' } });

const Opportunite = mongoose.model('Opportunite', opportuniteSchema);
export default Opportunite;