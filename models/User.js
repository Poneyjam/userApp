const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Adresse email invalide'],
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  text: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000, // limite facultative
  },

  avatarUrl: {
    type: String,
    default: '', // ou une URL vers une image par défaut
  },

}, {
  timestamps: true, // ajoute automatiquement createdAt et updatedAt
});


module.exports = mongoose.model('User', userSchema);
