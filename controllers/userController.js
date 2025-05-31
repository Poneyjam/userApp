const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Fonction d'inscription
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Vérifie si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    // Hash le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crée un nouvel utilisateur
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Fonction de connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cherche l'utilisateur dans la base
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });

    // Compare le mot de passe fourni avec le hash stocké
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

    // Génère un token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Renvoie le token et les infos utilisateur (sans le mot de passe)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
