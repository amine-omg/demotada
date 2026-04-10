// backend/models/CrmConfig.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const crmConfigSchema = new Schema({
    // A quelle école appartient cette configuration ?
    ecole: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ecole', // Assurez-vous d'avoir un modèle 'Ecole'
        required: true,
        unique: true // Une seule config par école
    },
    // Les colonnes du tunnel de vente (ex: Entrant, Devis, Facture)
    pipelineStages: [{
        name: { type: String, required: true },
        order: { type: Number, required: true }
    }],
    // Les motifs de perte (ex: Tarif trop élevé, Dates incompatibles)
    lossReasons: [{
        type: String
    }],
    // Les utilisateurs (commerciaux/managers) qui peuvent accéder à ce CRM
    managers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Assurez-vous d'avoir un modèle 'User'
    }]
}, { timestamps: true });

// Exportation du modèle CrmConfig
const CrmConfig = mongoose.model('CrmConfig', crmConfigSchema);
export default CrmConfig; // Utilisation de 'export default' pour un export unique