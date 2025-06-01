const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Fonction d'inscription
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Entrées invalides', errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email }).lean(); // lean = renvoie un objet JS simple
    if (existingUser) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà' });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création de l'utilisateur
    const user = new User({
      name: sanitize(name),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error('Erreur dans register:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction de connexion
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Entrées invalides', errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' }); // message générique pour éviter les attaques par enumeration
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erreur dans login:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Sanitize une chaîne pour éviter XSS (très simple version)
function sanitize(str) {
  return str.replace(/[<>&'"]/g, '');
}
