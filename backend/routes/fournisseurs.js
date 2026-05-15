const express = require("express");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const { z } = require("zod");
const router = express.Router();

const createFournisseurSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  contact: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
  type: z.string().optional(),
});

const updateFournisseurSchema = z.object({
  nom: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
  type: z.string().optional(),
});

// GET /api/fournisseurs — incluant historique commandes
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*,
         (SELECT COUNT(*) FROM ravitaillements WHERE fournisseur_id = f.id) AS livraisons,
         (SELECT COALESCE(SUM(montant), 0) FROM ravitaillements WHERE fournisseur_id = f.id) AS totalAchats
       FROM fournisseurs f
       ORDER BY f.nom`
    );

    // Historique par fournisseur si demandé
    if (req.query.historique === "1") {
      const ids = rows.map((f) => f.id);
      if (ids.length > 0) {
        const [hist] = await pool.query(
          `SELECT r.*, rd.ravitaillement_id, ps.nom AS produit_nom
           FROM ravitaillements r
           LEFT JOIN ravitaillement_details rd ON r.id = rd.ravitaillement_id
           LEFT JOIN produits_stock ps ON rd.produit_stock_id = ps.id
           WHERE r.fournisseur_id IN (?)
           ORDER BY r.date DESC`,
          [ids]
        );
        const histByFournisseur = {};
        hist.forEach((h) => {
          const fid = h.fournisseur_id;
          if (!histByFournisseur[fid]) histByFournisseur[fid] = [];
          histByFournisseur[fid].push(h);
        });
        rows.forEach((f) => {
          f.historique = histByFournisseur[f.id] || [];
        });
      } else {
        rows.forEach((f) => { f.historique = []; });
      }
    }

    res.json({ success: true, fournisseurs: rows });
  } catch (err) {
    console.error("Erreur get fournisseurs:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/fournisseurs/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM fournisseurs WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Non trouvé" });

    const [hist] = await pool.query(
      `SELECT r.*, ps.nom AS produit_nom
       FROM ravitaillements r
       LEFT JOIN ravitaillement_details rd ON r.id = rd.ravitaillement_id
       LEFT JOIN produits_stock ps ON rd.produit_stock_id = ps.id
       WHERE r.fournisseur_id = ?
       GROUP BY r.id
       ORDER BY r.date DESC`,
      [req.params.id]
    );

    res.json({ success: true, fournisseur: rows[0], historique: hist });
  } catch (err) {
    console.error("Erreur get fournisseur:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/fournisseurs
router.post("/", validate(createFournisseurSchema), async (req, res) => {
  try {
    const { nom, contact, email, adresse, type } = req.body;
    const [result] = await pool.query(
      "INSERT INTO fournisseurs (nom, contact, email, adresse, type) VALUES (?, ?, ?, ?, ?)",
      [nom, contact || null, email || null, adresse || null, type || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Fournisseur déjà existant" });
    }
    console.error("Erreur create fournisseur:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PUT /api/fournisseurs/:id
router.put("/:id", validate(updateFournisseurSchema), async (req, res) => {
  try {
    const { nom, contact, email, adresse, type } = req.body;
    await pool.query(
      `UPDATE fournisseurs SET
         nom = COALESCE(?, nom), contact = COALESCE(?, contact),
         email = COALESCE(?, email), adresse = COALESCE(?, adresse), type = COALESCE(?, type)
       WHERE id = ?`,
      [nom, contact, email, adresse, type, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur update fournisseur:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// DELETE /api/fournisseurs/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM fournisseurs WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Fournisseur supprimé" });
  } catch (err) {
    console.error("Erreur delete fournisseur:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
