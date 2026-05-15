const express = require("express");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const { auditLogger, logger } = require("../config/logger");
const { z } = require("zod");
const router = express.Router();

const transactionSchema = z.object({
  type_op: z.enum(["entree", "sortie"], { message: "type_op doit etre 'entree' ou 'sortie'" }),
  categorie: z.string().min(1, "Categorie requise"),
  montant: z.number().min(0, "Montant doit etre >= 0"),
  reference: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

const impotSchema = z.object({
  libelle: z.string().min(1, "Libelle requis"),
  montant: z.number().min(0, "Montant doit etre >= 0"),
  echeance: z.string().min(1, "Echeance requise"),
});

// ── Transactions ──

// GET /api/finances/transactions
router.get("/transactions", async (req, res) => {
  try {
    const { type_op, date, mois } = req.query;
    let sql = "SELECT * FROM transactions WHERE 1=1";
    const params = [];

    if (type_op) { sql += " AND type_op = ?"; params.push(type_op); }
    if (date) { sql += " AND date = ?"; params.push(date); }
    if (mois) { sql += " AND DATE_FORMAT(date, '%Y-%m') = ?"; params.push(mois); }

    sql += " ORDER BY date DESC, id DESC";
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, transactions: rows });
  } catch (err) {
    console.error("Erreur get transactions:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Bilan financier ──

// GET /api/finances/bilan?mois=2026-04
router.get("/bilan", async (req, res) => {
  try {
    const mois = req.query.mois || new Date().toISOString().slice(0, 7);

    const [entrees] = await pool.query(
      "SELECT COALESCE(SUM(montant), 0) AS total FROM transactions WHERE type_op = 'entree' AND DATE_FORMAT(date, '%Y-%m') = ?",
      [mois]
    );

    const [sorties] = await pool.query(
      "SELECT COALESCE(SUM(montant), 0) AS total FROM transactions WHERE type_op = 'sortie' AND DATE_FORMAT(date, '%Y-%m') = ?",
      [mois]
    );

    const [parCategorie] = await pool.query(
      `SELECT categorie, type_op, SUM(montant) AS total
       FROM transactions
       WHERE DATE_FORMAT(date, '%Y-%m') = ?
       GROUP BY categorie, type_op`,
      [mois]
    );

    const benefice = entrees[0].total - sorties[0].total;

    // Mois précédent
    const prevDate = new Date(mois + "-01");
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMois = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    const [prevBenefice] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0) AS benefice
       FROM transactions
       WHERE DATE_FORMAT(date, '%Y-%m') = ?`,
      [prevMois]
    );

    const tauxProg =
      prevBenefice[0].benefice !== 0
        ? (((benefice - prevBenefice[0].benefice) / Math.abs(prevBenefice[0].benefice)) * 100).toFixed(1)
        : null;

    res.json({
      success: true,
      bilan: {
        mois,
        ca: entrees[0].total,
        depenses: sorties[0].total,
        benefice,
        tauxProgression: tauxProg,
        parCategorie,
      },
    });
  } catch (err) {
    console.error("Erreur bilan financier:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Impôts ──

// GET /api/finances/impots
router.get("/impots", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM impots_taxes ORDER BY echeance");
  res.json({ success: true, impots: rows });
});

// POST /api/finances/impots
router.post("/impots", validate(impotSchema), async (req, res) => {
  try {
    const { libelle, montant, echeance } = req.body;
    const [result] = await pool.query(
      "INSERT INTO impots_taxes (libelle, montant, echeance) VALUES (?, ?, ?)",
      [libelle, montant, echeance]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Erreur impot:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/finances/impots/:id/payer
router.patch("/impots/:id/payer", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [impot] = await conn.query("SELECT * FROM impots_taxes WHERE id = ?", [req.params.id]);
    if (impot.length === 0) return res.status(404).json({ success: false, message: "Non trouvé" });

    await conn.query(
      "UPDATE impots_taxes SET statut = 'paye', date_paiement = CURDATE() WHERE id = ?",
      [req.params.id]
    );

    // Création transaction de sortie
    await conn.query(
      "INSERT INTO transactions (type_op, categorie, montant, reference, description, date) VALUES ('sortie', 'Impôts', ?, ?, ?, CURDATE())",
      [impot[0].montant, `IMPOT-${req.params.id}`, impot[0].libelle]
    );

    await conn.commit();

    auditLogger.info("AUDIT", {
      action: "IMPOT_PAIEMENT",
      userId: req.user?.id || "unknown",
      resourceId: req.params.id,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      method: req.method,
      url: req.originalUrl,
      description: `Paiement impôt: ${impot[0].libelle}`,
      success: true,
    });

    res.json({ success: true, message: "Impôt payé" });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur paiement impot:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

// POST /api/finances/transactions — enregistrer une transaction manuelle
router.post("/transactions", validate(transactionSchema), async (req, res) => {
  try {
    const { type_op, categorie, montant, reference, description, date } = req.body;
    const [result] = await pool.query(
      "INSERT INTO transactions (type_op, categorie, montant, reference, description, date) VALUES (?, ?, ?, ?, ?, ?)",
      [type_op, categorie, montant, reference || null, description || null, date || null]
    );

    auditLogger.info("AUDIT", {
      action: "TRANSACTION_CREATE",
      userId: req.user?.id || "unknown",
      resourceId: result.insertId,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      method: req.method,
      url: req.originalUrl,
      description: `Transaction ${type_op}: ${categorie} - ${montant}`,
      success: true,
    });

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Erreur transaction:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
