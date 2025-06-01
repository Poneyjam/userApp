const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path'); // ← ici, pas en double

dotenv.config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// ✅ Servir les fichiers du dossier /uploads (images d'avatar)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Rate limiting (anti-bruteforce pour login / register)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    message: 'Trop de tentatives, veuillez patienter une minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
const userRoutes = require('./routes/userRoutes');

// Appliquer le limiter uniquement aux routes sensibles
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Toutes les autres routes utilisateur
app.use('/api/users', userRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connecté"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
