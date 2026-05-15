/**
 * BarResto - Auth Middleware
 * Vérification du token JWT
 */
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "change_moi_secret_jwt_tres_long_et_complexe_2025";

/**
 * Authentifier l'utilisateur via le token JWT
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expiré" });
      }
      return res.status(401).json({ success: false, message: "Token invalide" });
    }

    // Vérifier que l'utilisateur existe encore
    const [rows] = await pool.query(
      "SELECT id, nom, prenom, email, role, poste, telephone, date_embauche, avatar, actif, first_login, last_seen FROM utilisateurs WHERE id = ? AND actif = TRUE",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Utilisateur introuvable ou inactif" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error("Authenticate error:", err);
    res.status(500).json({ success: false, message: "Erreur d'authentification" });
  }
}

/**
 * Restreindre l'accès aux admin uniquement
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: "Permission refusée" });
    }
    next();
  };
}

module.exports = { authenticate, requireRole, JWT_SECRET };