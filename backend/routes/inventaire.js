const express = require("express");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const { z } = require("zod");
const router = express.Router();

const inventaireSchema = z.object({
  produit_stock_id: z.number().int("produit_stock_id doit etre un entier"),
  stock_theorique: z.number().min(0, "stock_theorique doit etre >= 0"),
  stock_reel: z.number().min(0, "stock_reel doit etre >= 0"),
  manageur_id: z.number().int().optional(),
  note: z.string().optional(),
});

// GET /api/inventaires
router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT i.*, ps.nom AS produit_nom, ps.unite, u.prenom AS manageur
     FROM inventaires i
     LEFT JOIN produits_stock ps ON i.produit_stock_id = ps.id
     LEFT JOIN utilisateurs u ON i.manageur_id = u.id
     ORDER BY i.date_inventaire DESC, i.id DESC`
  );
  res.json({ success: true, inventaires: rows });
});

// POST /api/inventaires — créer un inventaire
router.post("/", validate(inventaireSchema), async (req, res) => {
  try {
    const { produit_stock_id, stock_theorique, stock_reel, manageur_id, note } = req.body;
    const ecart = stock_reel - stock_theorique;

    const [result] = await pool.query(
      "INSERT INTO inventaires (produit_stock_id, stock_theorique, stock_reel, ecart, manageur_id, note) VALUES (?, ?, ?, ?, ?, ?)",
      [produit_stock_id, stock_theorique, stock_reel, ecart, manageur_id || null, note || null]
    );

    res.status(201).json({ success: true, id: result.insertId, ecart });
  } catch (err) {
    console.error("Erreur inventaire:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
