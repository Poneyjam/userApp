const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login } = require('../controllers/userController');
const User = require('../models/User'); // Si besoin, sinon tu peux retirer cette ligne

// Route inscription
router.post('/register', register);

// Route connexion
router.post('/login', login);

// Route protégée pour récupérer le profil
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


// Nouvelle route PATCH pour mettre à jour le texte
router.patch('/profile/text', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { text },
      { new: true, select: '-password' }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
