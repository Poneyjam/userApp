const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  text: { type: String, default: '' }, // champ texte ajouté
});

module.exports = mongoose.model('User', userSchema);
