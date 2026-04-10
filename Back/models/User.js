// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true, 
    trim: true       
  },
  password: { type: String, required: true },
  
  // On simplifie l'enum des rôles ici
  role: {
    type: String,
    enum: ['admin', 'owner', 'manager', 'user', 'apprenant'], 
    default: 'user'
  },
  
  // Indispensable pour le Multi-Tenant
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false
  },

  photo: { type: String, default: '' },
  telephone: { type: String, default: '' },
  isOnboarded: { type: Boolean, default: false },
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  googleAuth: {
    googleId: { type: String, unique: true, sparse: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date }
  }
}, { timestamps: true });

// Middleware pour hasher le mot de passe avant de sauvegarder
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
