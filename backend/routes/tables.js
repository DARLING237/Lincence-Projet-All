const express = require("express");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const { z } = require("zod");
const router = express.Router();

const createTableSchema = z.object({
  numero: z.string().min(1, "numero requis"),
  places: z.number().int("places doit etre un entier").optional(),
  zone: z.string().optional(),
  statut: z.string().optional(),
  qr_actif: z.boolean().optional(),
});

const updateTableSchema = z.object({
  statut: z.string().optional(),
  qr_actif: z.coerce.boolean().default(false).optional(),
  places: z.coerce.number().int("places doit etre un entier").optional(),
  zone: z.string().optional(),
  numero: z.string().min(1, "numero invalide").optional(),
});

// GET /api/tables
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tables_salle ORDER BY zone, numero");
    res.json({ success: true, tables: rows });
  } catch (err) {
    console.error("Erreur tables:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PUT /api/tables/:id
router.put("/:id", validate(updateTableSchema), async (req, res) => {
  try {
    const { statut, qr_actif, places, zone, numero } = req.body;
    const fields = [];
    const values = [];

    if (numero !== undefined) { fields.push("numero = ?"); values.push(numero); }
    if (statut !== undefined) { fields.push("statut = ?"); values.push(statut); }
    if (qr_actif !== undefined) { fields.push("qr_actif = ?"); values.push(qr_actif ? 1 : 0); }
    if (places !== undefined) { fields.push("places = ?"); values.push(places); }
    if (zone !== undefined) { fields.push("zone = ?"); values.push(zone); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "Aucun champ à modifier" });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE tables_salle SET ${fields.join(", ")} WHERE id = ?`, values);

    const [updated] = await pool.query("SELECT * FROM tables_salle WHERE id = ?", [req.params.id]);
    res.json({ success: true, table: updated[0] });
  } catch (err) {
    console.error("Erreur update table:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/tables
router.post("/", validate(createTableSchema), async (req, res) => {
  try {
    const { numero, places, zone, statut, qr_actif } = req.body;
    const [result] = await pool.query(
      "INSERT INTO tables_salle (numero, places, zone, statut, qr_actif) VALUES (?, ?, ?, ?, ?)",
      [numero, places || 2, zone, statut || "libre", qr_actif !== false ? 1 : 0]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Numéro de table déjà existant" });
    }
    console.error("Erreur create table:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// DELETE /api/tables/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM tables_salle WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Table supprimée" });
  } catch (err) {
    console.error("Erreur delete table:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
