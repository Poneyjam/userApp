const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); 

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Rate limiting pour les routes sensibles
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Max 5 requêtes par IP
  message: {
    message: 'Trop de tentatives, veuillez patienter une minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
const userRoutes = require('./routes/userRoutes');

// Appliquer le rate limiter uniquement sur login et register
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Puis charger toutes les routes normalement
app.use('/api/users', userRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connecté"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours sur le port ${PORT}`);
});
