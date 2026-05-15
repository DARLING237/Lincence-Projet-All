const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getConnectionHistory } = require("../middleware/connectionTracker");
const pool = require("../config/db");

const router = express.Router();

/**
 * GET /api/connection-history
 * Récupère l'historique des connexions de l'utilisateur connecté
 * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const history = await getConnectionHistory(userId, startDate, endDate);

    // Transformer les données pour le frontend
    const formattedHistory = history.map(session => ({
      id: session.id,
      connexion_date: session.connexion_date,
      connexion_time: session.connexion_time,
      deconnexion_date: session.deconnexion_date,
      deconnexion_time: session.deconnexion_time,
      duree_session: session.duree_session,
      duree_formatee: formatDuration(session.duree_session),
      ip_address: session.ip_address,
      session_id: session.session_id
    }));

    res.json({
      success: true,
      history: formattedHistory,
      totalSessions: history.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * GET /api/connection-history/admin
 * Récupère l'historique des connexions de tous les utilisateurs (admin seulement)
 * Query params: userId, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 */
router.get("/admin", authenticate, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Permission refusée" });
    }

    const userId = req.query.userId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = `
      SELECT
        p.id,
        u.id as utilisateur_id,
        u.nom,
        u.prenom,
        u.email,
        u.role as utilisateur_role,
        DATE(p.date_connexion) as connexion_date,
        TIME(p.date_connexion) as connexion_time,
        DATE(p.date_deconnexion) as deconnexion_date,
        TIME(p.date_deconnexion) as deconnexion_time,
        p.duree_session,
        p.ip_address,
        p.session_id,
        p.date,
        p.date as date_presence
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

    // Formatter les données
    const formattedHistory = history.map(session => ({
      id: session.id,
      utilisateur_id: session.utilisateur_id,
      utilisateur_nom: session.nom,
      utilisateur_prenom: session.prenom,
      utilisateur_email: session.email,
      utilisateur_role: session.utilisateur_role,
      date_connexion: session.connexion_date,
      heure_connexion: session.connexion_time,
      date_deconnexion: session.deconnexion_date,
      heure_deconnexion: session.deconnexion_time,
      duree_session: session.duree_session,
      duree_formatee: formatDuration(session.duree_session),
      adresse_ip: session.ip_address,
      session_id: session.session_id,
      date_presence: session.date_presence
    }));

    res.json({
      success: true,
      history: formattedHistory,
      totalSessions: history.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique admin:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * GET /api/active-sessions
 * Récupère les sessions actives (admin seulement)
 */
router.get("/active-sessions", authenticate, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Permission refusée" });
    }

    const [activeSessions] = await pool.execute(`
      SELECT
        u.id,
        u.nom,
        u.prenom,
        u.email,
        u.role as utilisateur_role,
        p.date_connexion,
        p.ip_address,
        p.session_id,
        TIMESTAMPDIFF(SECOND, p.date_connexion, NOW()) as duree_en_secondes
      FROM presences p
      JOIN utilisateurs u ON p.personnel_id = u.id
      WHERE p.date_deconnexion IS NULL
      AND p.statut = 'present'
      ORDER BY p.date_connexion DESC
    `);

    const formattedSessions = activeSessions.map(session => ({
      ...session,
      duree_formatee: formatDuration(session.duree_en_secondes)
    }));

    res.json({
      success: true,
      activeSessions: formattedSessions,
      count: activeSessions.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions actives:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Fonction pour formater la durée
function formatDuration(seconds) {
  if (!seconds) return "N/A";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

module.exports = router;