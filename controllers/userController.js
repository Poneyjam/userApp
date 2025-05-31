const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // ton modèle Mongoose

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cherche user dans la base
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });

    // Compare les mots de passe (celui envoyé et le hash stocké)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

    // Génère un token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,  // Assure-toi que cette variable est définie dans .env
      { expiresIn: '1h' }
    );
    console.log("JWT_SECRET =", process.env.JWT_SECRET);

    // Renvoie token + user (sans le password)
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
