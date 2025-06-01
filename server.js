const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();

// ✅ Middleware global CORS – AJOUTE-LE ICI
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou restreins à ton domaine en prod
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Autres middlewares
app.use(cors());
app.use(express.json());

// ✅ Rate limiter
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: 'Trop de tentatives, veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
const userRoutes = require('./routes/userRoutes');

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/api/users', userRoutes);

// Statique pour les avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion MongoDB
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
