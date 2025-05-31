const auth = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const User = require("../models/User"); // N’oublie pas d’importer User ici !
const { register, login } = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);

// Route protégée
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
