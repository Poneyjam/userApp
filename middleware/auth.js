const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Accès refusé : pas de token" });
  }

  // Vérifie que le header commence bien par "Bearer "
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Format du token invalide" });
  }

  // Extrait la partie après "Bearer "
  const token = authHeader.substring(7, authHeader.length).trim();

  try {
    console.log("Token reçu :", token);
    console.log("JWT_SECRET :", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // on ajoute les données décodées à la requête
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};
