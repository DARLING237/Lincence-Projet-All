const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const auditMiddleware = require("../middleware/auditLogger");
const { z } = require("zod");
const router = express.Router();
const {authenticate,requireRole } = require("../middleware/auth");

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  mot_de_passe: z.string().min(1, "Mot de passe requis"),
});

const registerSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prenom requis"),
  email: z.string().email("Email invalide"),
  mot_de_passe: z.string().min(6, "Mot de passe minimum 6 caracteres"),
  role: z.string().min(1, "Role requis"),
  poste: z.string().optional(),
  telephone: z.string().optional(),
  date_embauche: z.string().optional(),
  avatar: z.string().optional(),
});

const changePasswordSchema = z.object({
  ancien_mot_de_passe: z.string().min(1, "Mot de passe actuel requis"),
  nouveau_mot_de_passe: z.string().min(6, "Nouveau mot de passe minimum 6 caracteres"),
});

/**
 * POST /api/auth/login
 * Body: { email, mot_de_passe }
 */
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) {
      return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
    }

    const [rows] = await pool.query(
      "SELECT id, nom, prenom, email, mot_de_passe, role, poste, telephone, date_embauche, avatar, first_login FROM utilisateurs WHERE email = ? AND actif = TRUE",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }

    const user = rows[0];
    console.log("[LOGIN] User found:", user.email, "password hash:", user.mot_de_passe?.substring(0, 10));

    // Vérifier mot de passe (hash ou plain texte pour dev)
    const isHashed = user.mot_de_passe.startsWith("$2");
    let isMatch = false;
    if (isHashed) {
      isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    } else {
      isMatch = mot_de_passe === user.mot_de_passe;
      console.log("[LOGIN] Plain text compare:", { input: mot_de_passe, stored: user.mot_de_passe, match: isMatch });
    }
    console.log("[LOGIN] Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Marquer la présence du jour
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().substring(0, 5);
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const sessionId = `session_${user.id}_${Date.now()}`;

    try {
      await pool.query(
        `INSERT INTO presences (personnel_id, date, heure_arrivee, date_connexion, heure_connexion, ip_address, session_id, statut)
         VALUES (?, ?, ?, NOW(), CURTIME(), ?, ?, 'present')`,
        [user.id, today, now, ip, sessionId]
      );
    } catch (err) {
      console.error("Erreur présence:", err.message);
    }

    // Ne pas renvoyer le mot de passe
    const { mot_de_passe: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token, first_login: user.first_login === 1 });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * POST /api/auth/register — admin seulement
 * Protégé par requireRole("admin") pour empêcher la création de comptes non autorisée.
 * Le password est systématiquement hashé avec bcrypt — aucun fallback en clair.
 */
router.post("/register", requireRole("admin"), validate(registerSchema), auditMiddleware({ action: "USER_REGISTER", description: "Nouvel utilisateur cree" }), async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, poste, telephone, date_embauche, avatar, salaire } =
      req.body;

    if (!nom || !prenom || !email || !mot_de_passe || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Champs obligatoires manquants" });
    }

    const hashed = await bcrypt.hash(mot_de_passe, 10);

    const [result] = await pool.query(
      "INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, poste, telephone, date_embauche, avatar, first_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)",
      [nom, prenom, email, hashed, role || "serveur", poste || null, telephone || null, date_embauche || null, avatar || null]
    );

    const userId = result.insertId;

    // Creer le salaire du mois courant si un montant est fourni
    if (salaire) {
      const moisAnnee = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      await pool.query(
        "INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (?, ?, ?, 'en attente', CURDATE())",
        [userId, moisAnnee, parseInt(salaire)]
      );
    }

    // Creer la presence du jour
    const now = new Date();
    await pool.query(
      "INSERT INTO presences (personnel_id, heure_arrivee, date, statut) VALUES (?, ?, ?, 'present')",
      [userId, now.toTimeString().substring(0, 5), now.toISOString().split("T")[0]]
    );

    res.status(201).json({ success: true, id: userId, message: "Utilisateur créé" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Email déjà utilisé" });
    }
    console.error("Erreur register:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * PATCH /api/auth/change-password — change own password
 * Requires auth (user must be logged in). After success, first_login is set to FALSE.
 */
router.patch("/change-password",authenticate, validate(changePasswordSchema), async (req, res) => {


  try {

    // Authenticate first
    authenticate(req, res, async () => {
      try {
        const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
        const userId = req.user.id;

        // Fetch current password
        const [rows] = await pool.query(
          "SELECT mot_de_passe FROM utilisateurs WHERE id = ?",
          [userId]
        );

        if (rows.length === 0) {
          return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        const currentHash = rows[0].mot_de_passe;
        const isMatch = currentHash.startsWith("$2")
          ? await bcrypt.compare(ancien_mot_de_passe, currentHash)
          : ancien_mot_de_passe === currentHash;

        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Mot de passe actuel incorrect" });
        }

        const newHash = await bcrypt.hash(nouveau_mot_de_passe, 10);
        await pool.query(
          "UPDATE utilisateurs SET mot_de_passe = ?, first_login = FALSE WHERE id = ?",
          [newHash, userId]
        );

        res.json({ success: true, message: "Mot de passe modifié" });
      } catch (err) {
        console.error("Erreur change-password:", err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
      }
    });
  } catch (err) {
    console.error("Erreur change-password:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

router.post("/heartbeat", authenticate, async (req, res) => {
  try {
    await pool.query("UPDATE utilisateurs SET last_seen = NOW() WHERE id = ?", [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur heartbeat:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur et enregistre l'heure de déconnexion
 */
router.post("/logout", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Mettre à jour la présence avec l'heure de départ et calculer la durée
    const today = new Date().toISOString().split("T")[0];
    console.log("[LOGOUT] Update presence:", { userId, today });
    try {
      const [result] = await pool.query(
        `UPDATE presences
         SET heure_depart = CURTIME(),
             date_deconnexion = NOW(),
             heure_deconnexion = CURTIME(),
             duree_session = TIMESTAMPDIFF(SECOND, date_connexion, NOW()),
             statut = 'present'
         WHERE personnel_id = ?
         AND date = ?
         AND (heure_depart IS NULL OR date_deconnexion IS NULL)`,
        [userId, today]
      );
      console.log("[LOGOUT] Presence updated, affected rows:", result.affectedRows);
    } catch (err) {
      console.error("[LOGOUT] Erreur presence:", err.message);
    }

    // Si on utilise des sessions côté serveur (express-session)
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error('Erreur destruction session:', err);
        }
      });
    }

    // Invalider le token JWT côté client (le client doit supprimer le token)
    res.json({ success: true, message: "Déconnexion réussie" });
  } catch (err) {
    console.error("Erreur logout:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
