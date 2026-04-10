import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    ecole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ecole',
        default: null
    },
    formations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Formation'
    }]
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

categorySchema.index({ name: 1, ecole: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
