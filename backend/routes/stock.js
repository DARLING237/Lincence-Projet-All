const express = require("express");
const pool = require("../config/db");
const { auditLogger } = require("../config/logger");
const validate = require("../middleware/validate");
const { z } = require("zod");
const router = express.Router();

const createStockSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  unite: z.string().min(1, "Unite requise"),
  stock_actuel: z.number().min(0, "stock_actuel doit etre >= 0").optional(),
  stock_min: z.number().min(0, "stock_min doit etre >= 0").optional(),
});

const updateStockSchema = z.object({
  stock_actuel: z.number().min(0, "stock_actuel doit etre >= 0").optional(),
  stock_min: z.number().min(0, "stock_min doit etre >= 0").optional(),
});

const ravitaillementDetailSchema = z.object({
  produit_stock_id: z.number().int("produit_stock_id doit etre un entier"),
  quantite: z.number().min(0, "quantite doit etre >= 0"),
  prix: z.number().optional(),
});

const createRavitaillementSchema = z.object({
  fournisseur_id: z.number().int().optional(),
  date: z.string().optional(),
  nb_facture: z.string().optional(),
  photo_facture: z.string().optional(),
  details: z.array(ravitaillementDetailSchema).min(1, "Details requis"),
});

// ── Stock Produits ──

// GET /api/stock — tous les produits du stock + alertes
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, 
             COALESCE(
               (SELECT CASE WHEN rd.quantite > 0 THEN rd.prix / rd.quantite ELSE 0 END
                FROM ravitaillement_details rd 
                JOIN ravitaillements r ON rd.ravitaillement_id = r.id 
                WHERE rd.produit_stock_id = p.id 
                ORDER BY r.date DESC, r.id DESC 
                LIMIT 1), 
               0
             ) AS dernier_prix_achat
      FROM produits_stock p
      ORDER BY p.nom
    `);
    res.json({ success: true, stock: rows });
  } catch (err) {
    console.error("Erreur get stock:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/stock/alertes — produits sous le stock minimum
router.get("/alertes", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, 
             COALESCE(
               (SELECT CASE WHEN rd.quantite > 0 THEN rd.prix / rd.quantite ELSE 0 END
                FROM ravitaillement_details rd 
                JOIN ravitaillements r ON rd.ravitaillement_id = r.id 
                WHERE rd.produit_stock_id = p.id 
                ORDER BY r.date DESC, r.id DESC 
                LIMIT 1), 
               0
             ) AS dernier_prix_achat
      FROM produits_stock p
      WHERE p.stock_actuel < p.stock_min
      ORDER BY p.nom
    `);
    res.json({ success: true, alertes: rows });
  } catch (err) {
    console.error("Erreur get alertes stock:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PUT /api/stock/:id
router.put("/:id", validate(updateStockSchema), async (req, res) => {
  try {
    const { stock_actuel, stock_min } = req.body;
    const fields = [];
    const values = [];
    if (stock_actuel !== undefined) { fields.push("stock_actuel = ?"); values.push(stock_actuel); }
    if (stock_min !== undefined) { fields.push("stock_min = ?"); values.push(stock_min); }
    if (fields.length === 0) return res.status(400).json({ success: false, message: "Rien à modifier" });

    values.push(req.params.id);
    await pool.query(`UPDATE produits_stock SET ${fields.join(", ")} WHERE id = ?`, values);
    const [updated] = await pool.query("SELECT * FROM produits_stock WHERE id = ?", [req.params.id]);
    res.json({ success: true, produit: updated[0] });
  } catch (err) {
    console.error("Erreur update stock:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/stock — ajouter un produit au stock
router.post("/", validate(createStockSchema), async (req, res) => {
  try {
    const { nom, unite, stock_actuel, stock_min } = req.body;
    const [result] = await pool.query(
      "INSERT INTO produits_stock (nom, unite, stock_actuel, stock_min) VALUES (?, ?, ?, ?)",
      [nom, unite, stock_actuel || 0, stock_min || 0]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Erreur create stock:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Ravitaillements ──

// GET /api/stock/ravitaillements
router.get("/ravitaillements", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, f.nom AS fournisseur_nom
       FROM ravitaillements r
       LEFT JOIN fournisseurs f ON r.fournisseur_id = f.id
       ORDER BY r.date DESC`
    );

    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const [details] = await pool.query(
        `SELECT rd.*, ps.nom AS produit_nom, ps.unite
         FROM ravitaillement_details rd
         LEFT JOIN produits_stock ps ON rd.produit_stock_id = ps.id
         WHERE rd.ravitaillement_id IN (?)
         ORDER BY rd.id`,
        [ids]
      );
      rows.forEach((rav) => {
        rav.details = details.filter((d) => d.ravitaillement_id === rav.id);
      });
    }

    res.json({ success: true, ravitaillements: rows });
  } catch (err) {
    console.error("Erreur get ravitaillements:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/stock/ravitaillements — créer un ravitaillement complet
router.post("/ravitaillements", validate(createRavitaillementSchema), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { fournisseur_id, date, nb_facture, photo_facture, details } = req.body;

    if (!details || details.length === 0) {
      return res.status(400).json({ success: false, message: "Détails requis" });
    }

    // Calculer le montant total (à ajuster selon votre logique)
    const montant = details.reduce((sum, d) => sum + (d.prix || 0), 0);

    const [ravResult] = await conn.query(
      "INSERT INTO ravitaillements (fournisseur_id, date, montant, nb_facture, photo_facture) VALUES (?, ?, ?, ?, ?)",
      [fournisseur_id, date || null, montant, nb_facture || null, photo_facture || null]
    );

    const ravId = ravResult.insertId;

    // Comptabilité : Créer une transaction de sortie pour le ravitaillement fournisseur
    await conn.query(
      "INSERT INTO transactions (type_op, categorie, montant, reference, description, date) VALUES ('sortie', 'Ravitaillement', ?, ?, ?, COALESCE(?, CURDATE()))",
      [montant, `RAV-${ravId}`, `Ravitaillement Facture ${nb_facture || 'N/A'}`, date || null]
    );

    for (const det of details) {
      // Insérer détail (avec enregistrement du prix unitaire/total de l'ingrédient)
      await conn.query(
        "INSERT INTO ravitaillement_details (ravitaillement_id, produit_stock_id, quantite, prix) VALUES (?, ?, ?, ?)",
        [ravId, det.produit_stock_id, det.quantite, det.prix || 0]
      );

      // Mise à jour automatique du stock
      await conn.query(
        "UPDATE produits_stock SET stock_actuel = stock_actuel + ?, dernier_ravitaillement = CURDATE(), alerte = FALSE WHERE id = ?",
        [det.quantite, det.produit_stock_id]
      );

      // Historique mouvement
      await conn.query(
        "INSERT INTO mouvements_stock (produit_stock_id, type, quantite, raison, reference_id) VALUES (?, 'entree', ?, 'Ravitaillement', ?)",
        [det.produit_stock_id, det.quantite, ravId]
      );
    }

    await conn.commit();

    auditLogger.info("AUDIT", {
      action: "STOCK_RAVITAILLEMENT",
      userId: req.user?.id || "unknown",
      resourceId: ravId,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      method: req.method,
      url: req.originalUrl,
      description: `Ravitaillement: ${details.length} produits`,
      success: true,
    });

    res.status(201).json({ success: true, ravitaillement_id: ravId });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur ravitaillement:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

// ── Mouvements de Stock ──

// GET /api/stock/mouvements
router.get("/mouvements", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ms.*, ps.nom AS produit_nom, ps.unite
       FROM mouvements_stock ms
       LEFT JOIN produits_stock ps ON ms.produit_stock_id = ps.id
       ORDER BY ms.date DESC
       LIMIT 100`
    );
    res.json({ success: true, mouvements: rows });
  } catch (err) {
    console.error("Erreur get mouvements:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
