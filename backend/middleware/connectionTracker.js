/**
 * BarResto - Connection Tracker Middleware
 * Suivi des connexions/déconnexions des utilisateurs
 */
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_moi_secret_jwt_tres_long_et_complexe_2025";

/**
 * Créer une nouvelle session de connexion
 */
async function createConnectionSession(userId, ipAddress, sessionId) {
  try {
    // Fermer toute session précédente non fermée
    await pool.query(
      "UPDATE presences SET date_deconnexion = NOW(), statut = 'absent' WHERE personnel_id = ? AND date_deconnexion IS NULL",
      [userId]
    );

    // Créer une nouvelle entrée de présence
    const [result] = await pool.query(
      "INSERT INTO presences (personnel_id, date_connexion, heure_connexion, statut, ip_address, session_id) VALUES (?, NOW(), NOW(), 'present', ?, ?)",
      [userId, ipAddress || null, sessionId || null]
    );

    return result.insertId;
  } catch (err) {
    console.error("Erreur création session:", err);
    return null;
  }
}

/**
 * Fermer une session de connexion
 */
async function closeConnectionSession(userId, sessionId) {
  try {
    await pool.query(
      "UPDATE presences SET date_deconnexion = NOW(), heure_deconnexion = NOW(), statut = 'absent', duree_session = TIMESTAMPDIFF(SECOND, date_connexion, NOW()) WHERE personnel_id = ? AND date_deconnexion IS NULL AND session_id = ?",
      [userId, sessionId]
    );
  } catch (err) {
    console.error("Erreur fermeture session:", err);
  }
}

/**
 * Fermer toutes les sessions d'un utilisateur
 */
async function closeAllSessions(userId) {
  try {
    await pool.query(
      "UPDATE presences SET date_deconnexion = NOW(), heure_deconnexion = NOW(), statut = 'absent', duree_session = TIMESTAMPDIFF(SECOND, date_connexion, NOW()) WHERE personnel_id = ? AND date_deconnexion IS NULL",
      [userId]
    );
  } catch (err) {
    console.error("Erreur fermeture toutes sessions:", err);
  }
}

/**
 * Récupérer l'historique de connexion
 */
async function getConnectionHistory(userId, startDate, endDate) {
  let query = `
    SELECT
      p.id,
      p.personnel_id,
      u.nom,
      u.prenom,
      u.email,
      u.role AS utilisateur_role,
      DATE(p.date_connexion) as connexion_date,
      TIME(p.date_connexion) as connexion_time,
      DATE(p.date_deconnexion) as deconnexion_date,
      TIME(p.date_deconnexion) as deconnexion_time,
      p.duree_session,
      p.ip_address,
      p.session_id,
      DATE(p.date) as date_presence
    FROM presences p
    JOIN utilisateurs u ON p.personnel_id = u.id
    WHERE p.date_connexion IS NOT NULL
  `;

  const params = [];

  if (userId) {
    query += " AND u.id = ?";
    params.push(userId);
  }

  if (startDate) {
    query += " AND DATE(p.date_connexion) >= ?";
    params.push(startDate);
  }

  if (endDate) {
    query += " AND DATE(p.date_connexion) <= ?";
    params.push(endDate);
  }

  query += " ORDER BY p.date_connexion DESC";

  const [history] = await pool.execute(query, params);
  return history;
}

/**
 * Middleware d'authentification JWT pour les routes de suivi
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query(
      "SELECT id, nom, prenom, email, role FROM utilisateurs WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Utilisateur introuvable" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expiré" });
    }
    return res.status(401).json({ success: false, message: "Token invalide" });
  }
}

module.exports = {
  createConnectionSession,
  closeConnectionSession,
  closeAllSessions,
  getConnectionHistory,
  authenticateToken,
};