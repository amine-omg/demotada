import mongoose from 'mongoose';

const prospectSchema = new mongoose.Schema({
    prenom: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true
    },
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        trim: true,
        lowercase: true
    },
    telephone: {
        type: String,
        trim: true,
        default: ''
    },
    ecole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ecole',
        required: true // Très important pour que chaque école ait SA base de prospects
    },
    // Ce champ nous servira pour la fameuse "Fusion" le jour où il s'inscrit !
    userAssocie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { 
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

const Prospect = mongoose.model('Prospect', prospectSchema);

export default Prospect;