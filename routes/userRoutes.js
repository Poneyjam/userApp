const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { register, login } = require('../controllers/userController');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Config stockage Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Crée ce dossier à la racine du projet
  },
  filename: function (req, file, cb) {
    const uniqueName = `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2Mo
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Format d’image invalide'), false);
    }
    cb(null, true);
  }
});


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

// Nouvelle route POST : upload d'avatar avec gestion erreurs multer + suppression ancienne image
router.post('/profile/avatar', auth, (req, res, next) => {
  upload.single('avatar')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // Erreur liée à multer (ex: fichier trop lourd)
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Autre erreur (ex: format non autorisé)
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) return res.status(400).json({ message: 'Aucune image fournie.' });

      // Récupérer l'utilisateur pour supprimer l'ancienne image si elle existe
      const user = await User.findById(req.user.userId);

      if (user.avatarUrl) {
        const oldFilename = user.avatarUrl.split('/uploads/')[1];
        if (oldFilename) {
          const oldPath = path.join(__dirname, '..', 'uploads', oldFilename);
          fs.unlink(oldPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Erreur suppression ancien avatar:', unlinkErr);
              // On ne bloque pas la requête si suppression échoue
            }
          });
        }
      }

      // Construire la nouvelle URL avatar
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      // Mettre à jour avatarUrl
      user.avatarUrl = imageUrl;
      await user.save();

      res.json(user);

    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l’upload de l’avatar', error: error.message });
    }
  });
});

module.exports = router;
