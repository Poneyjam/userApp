const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { register, login } = require('../controllers/userController');
const User = require('../models/User');

// ✅ Route inscription avec validation
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères')
    .escape(),

  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
], register);

// ✅ Route connexion avec validation
router.post('/login', [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
], login);

// ✅ Route protégée : récupérer le profil
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ✅ Route PATCH protégée : mettre à jour le texte personnel
router.patch('/profile/text', [
  auth,
  body('text')
    .trim()
    .isLength({ min: 1 }).withMessage('Le texte ne peut pas être vide')
    .escape(),
], async (req, res) => {
  try {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Entrée invalide', errors: errors.array() });
    }

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
