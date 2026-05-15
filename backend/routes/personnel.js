const express = require("express");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const { auditLogger, logger } = require("../config/logger");
const { z } = require("zod");
const router = express.Router();

const updatePersonnelSchema = z.object({
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  role: z.string().optional(),
  poste: z.string().optional(),
  telephone: z.string().optional(),
  date_embauche: z.string().optional(),
  actif: z.boolean().optional(),
});

const presenceSchema = z.object({
  personnel_id: z.number().int("personnel_id doit etre un entier"),
  heure_arrivee: z.string().optional(),
  statut: z.string().optional(),
});

const departSchema = z.object({
  heure_depart: z.string().optional(),
});

// ── Personnel (tous les utilisateurs ayant un poste) ──

// GET /api/personnel
router.get("/", async (req, res) => {
  const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const [rows] = await pool.query(
    `SELECT u.id, u.nom, u.prenom, u.email, u.role, u.poste, u.telephone, u.date_embauche, u.avatar, u.actif, last_seen,
            COALESCE(s.montant, 0) AS salaire
     FROM utilisateurs u
     LEFT JOIN salaires s ON u.id = s.personnel_id AND s.mois_annee = ?
     WHERE u.role != 'admin' OR u.poste IS NOT NULL
     ORDER BY u.poste, u.nom`,
    [moisCourant]
  );
  res.json({ success: true, personnel: rows });
});

// POST /api/personnel/heartbeat — met a jour last_seen de l'utilisateur
router.post("/heartbeat", async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ success: false });
  await pool.query("UPDATE utilisateurs SET last_seen = NOW() WHERE id = ?", [req.user.id]);
  res.json({ success: true });
});

// PUT /api/personnel/:id
router.put("/:id", validate(updatePersonnelSchema), async (req, res) => {
  try {
    const { nom, prenom, email, role, poste, telephone, date_embauche, actif } = req.body;
    await pool.query(
      `UPDATE utilisateurs SET nom = COALESCE(?, nom), prenom = COALESCE(?, prenom),
         email = COALESCE(?, email), role = COALESCE(?, role), poste = COALESCE(?, poste),
         telephone = COALESCE(?, telephone), date_embauche = COALESCE(?, date_embauche), actif = COALESCE(?, actif)
       WHERE id = ?`,
      [nom, prenom, email, role, poste, telephone, date_embauche, actif, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur update personnel:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Présences ──
router.get("/presences", async (req, res) => {
  const { date } = req.query;
  const [rows] = await pool.query(
    `SELECT p.*, u.nom, u.prenom, u.poste FROM presences p
     JOIN utilisateurs u ON p.personnel_id = u.id
     ${date ? "WHERE p.date = ?" : "ORDER BY p.date DESC LIMIT 100"}`,
    date ? [date] : []
  );
  res.json({ success: true, presences: rows });
});

router.post("/presences", validate(presenceSchema), async (req, res) => {
  try {
    const { personnel_id, heure_arrivee, statut } = req.body;
    const [result] = await pool.query(
      "INSERT INTO presences (personnel_id, heure_arrivee, date, statut) VALUES (?, ?, CURDATE(), ?)",
      [personnel_id, heure_arrivee || null, statut || "present"]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Erreur pointage:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH / presences/:id/depart
router.patch("/presences/:id/depart", async (req, res) => {
  const { heure_depart } = req.body;
  await pool.query("UPDATE presences SET heure_depart = ? WHERE id = ?", [heure_depart || "18:00", req.params.id]);
  res.json({ success: true });
});

// ── Salaires ──
router.get("/salaires", async (req, res) => {
  const { mois_annee } = req.query;
  const moisAnnee = mois_annee || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  // Generer les salaires si pas encore crees pour ce mois
  const [existing] = await pool.query("SELECT personnel_id FROM salaires WHERE mois_annee = ?", [moisAnnee]);
  const existingIds = new Set(existing.map((r) => r.personnel_id));

  const [actifs] = await pool.query("SELECT id, poste FROM utilisateurs WHERE actif = TRUE AND poste IS NOT NULL ORDER BY id");
  for (const u of actifs) {
    if (!existingIds.has(u.id)) {
      const posteL = u.poste.toLowerCase();
      const salaireParDefaut = posteL.includes("manageur") || posteL.includes("gerant") ? 500000 : posteL.includes("barman") ? 250000 : 200000;
      await pool.query(
        "INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (?, ?, ?, 'en attente', CURDATE())",
        [u.id, moisAnnee, salaireParDefaut]
      );
    }
  }

  // Recuperr les salaires du mois existants
  const [rows] = await pool.query(
    `SELECT s.*, u.nom, u.prenom, u.poste FROM salaires s
     JOIN utilisateurs u ON s.personnel_id = u.id
     WHERE s.mois_annee = ?
     ORDER BY u.prenom, u.nom`,
    [moisAnnee]
  );

  // Fixer les salaires a 0 avec un defaut
  for (const s of rows) {
    if (!s.montant || s.montant === 0) {
      const posteL = s.poste.toLowerCase();
      const defaut = posteL.includes("manageur") || posteL.includes("gerant") ? 500000 : posteL.includes("barman") ? 250000 : 200000;
      await pool.query("UPDATE salaires SET montant = ? WHERE id = ? AND montant = 0", [defaut, s.id]);
    }
  }

  // Retourner les salaires corriges
  const [fixedRows] = await pool.query(
    `SELECT s.*, u.nom, u.prenom, u.poste FROM salaires s
     JOIN utilisateurs u ON s.personnel_id = u.id
     WHERE s.mois_annee = ?
     ORDER BY u.prenom, u.nom`,
    [moisAnnee]
  );
  res.json({ success: true, salaires: fixedRows });
});

router.post("/salaires", async (req, res) => {
  const { personnel_id, montant, mois_annee } = req.body;
  if (!personnel_id || !montant) return res.status(400).json({ success: false, message: "Donnees invalides" });
  const mois = mois_annee || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  try {
    await pool.query("INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (?, ?, ?, 'en attente', CURDATE())", [personnel_id, mois, montant]);
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "Salaire deja existe" });
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

router.patch("/salaires/:id", async (req, res) => {
  const { montant } = req.body;
  if (!montant || !Number.isInteger(montant)) {
    return res.status(400).json({ success: false, message: "Montant invalide" });
  }
  await pool.query("UPDATE salaires SET montant = ? WHERE id = ?", [montant, req.params.id]);
  res.json({ success: true, message: "Salaire mis a jour" });
});

router.patch("/salaires/:id/payer", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [sal] = await conn.query("SELECT * FROM salaires WHERE id = ?", [req.params.id]);
    if (sal.length === 0) return res.status(404).json({ success: false, message: "Non trouvé" });

    await conn.query("UPDATE salaires SET statut = 'paye', date_paiement = CURDATE() WHERE id = ?", [req.params.id]);

    await conn.query(
      "INSERT INTO transactions (type_op, categorie, montant, reference, description, date) VALUES ('sortie', 'Salaires', ?, ?, ?, CURDATE())",
      [sal[0].montant, `SAL-${sal[0].id}`, `Salaire ${sal[0].mois_annee}`]
    );

    await conn.commit();

    const [rows] = await pool.query(
      "SELECT * FROM salaires WHERE id = ?",
      [req.params.id]
    );

    auditLogger.info("AUDIT", {
      action: "SALAIRE_PAIEMENT",
      userId: req.user?.id || "unknown",
      resourceId: req.params.id,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      method: req.method,
      url: req.originalUrl,
      description: `Paiement salaire pour ${rows[0]?.mois_annee || "N/A"}`,
      success: true,
    });

    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    logger.error("Erreur salaire", { error: err.message });
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

module.exports = router;
