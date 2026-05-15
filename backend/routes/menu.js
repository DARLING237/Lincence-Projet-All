const express = require("express");
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const { z } = require("zod");
const router = express.Router();

// Decode base64 data URL and save to disk, return the path
function saveBase64Image(base64Str, uploadDir) {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const mimeMatch = base64Str.match(/^data:(image\/\w+);base64,/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const extMap = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
  const ext = extMap[mime] || ".jpg";
  const base64Data = base64Str.replace(/^data:(image\/\w+);base64,/, "");
  const filename = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
  return "/uploads/menu/" + filename;
}

const updateProduitSchema = z.object({
  categorie_id: z.number().int().optional(),
  nom: z.string().optional(),
  description: z.string().nullable().optional(),
  prix: z.number().min(0, "Prix doit etre >= 0").optional(),
  type_poste: z.enum(["bar"], { message: "Type invalide" }).optional(),
  dispo: z.boolean().optional(),
  bestseller: z.boolean().optional(),
  photo: z.string().nullable().optional(),
});

// ── Catégories ──

// GET /api/menu/categories
router.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY ordre_affiche");
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error("Erreur get categories:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Produits ──

// GET /api/menu/produits
router.get("/produits", async (req, res) => {
  try {
    await pool.query("UPDATE produits_menu SET photo = NULL WHERE photo LIKE 'data:image%'");
    const [produits] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom, c.type_poste AS categorie_type
       FROM produits_menu p
       LEFT JOIN categories c ON p.categorie_id = c.id
       ORDER BY c.ordre_affiche, p.nom`
    );
    res.json({ success: true, produits });
  } catch (err) {
    console.error("Erreur get produits:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/menu/produits — handles both multipart AND JSON
router.post("/produits", async (req, res) => {
  console.log("[POST /produits] content-type:", req.headers["content-type"]);
  const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");

  if (isMultipart) {
    return upload.single("photo")(req, res, async (err) => {
      if (err) {
        console.error("Upload error:", err.message);
        return res.status(400).json({ success: false, message: err.message });
      }
      try {
        const { categorie_id, categorie, nom, description, prix, type_poste, dispo, bestseller } = req.body || {};
        if (!nom || !nom.trim()) return res.status(400).json({ success: false, message: "Nom du produit requis" });
        const prixNum = parseFloat(prix);
        if (isNaN(prixNum) || prixNum < 0) return res.status(400).json({ success: false, message: "Prix invalide" });
        if (type_poste !== "bar") return res.status(400).json({ success: false, message: "Type invalide, doit etre 'bar'" });

        let cid = categorie_id ? parseInt(categorie_id) : null;
        if (categorie && !cid) {
          const [catRows] = await pool.query("SELECT id FROM categories WHERE nom = ?", [categorie]);
          if (catRows.length === 0) return res.status(400).json({ success: false, message: `Categorie "${categorie}" introuvable` });
          cid = catRows[0].id;
        }

        const photoPath = req.file ? "/uploads/menu/" + req.file.filename : null;
        const [result] = await pool.query(
          "INSERT INTO produits_menu (categorie_id, nom, description, prix, type_poste, dispo, bestseller, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [cid, nom.trim(), description?.trim() || null, prixNum, type_poste, dispo !== "false" ? 1 : 0, bestseller === "true" ? 1 : 0, photoPath]
        );
        return res.status(201).json({ success: true, id: result.insertId });
      } catch (e) {
        console.error("Erreur create produit:", e);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
    });
  }

  // ── JSON body ──
  try {
    let { categorie_id, categorie, nom, description, prix, type_poste, dispo, bestseller, photo } = req.body || {};
    if (!nom || !nom.trim()) return res.status(400).json({ success: false, message: "Nom du produit requis" });
    if (!prix || typeof prix !== "number" || isNaN(prix) || prix < 0) return res.status(400).json({ success: false, message: "Prix invalide" });
    if (!type_poste || type_poste !== "bar") return res.status(400).json({ success: false, message: "Type invalide, doit etre 'bar'" });

    if (categorie && !categorie_id) {
      const [catRows] = await pool.query("SELECT id FROM categories WHERE nom = ?", [categorie]);
      if (catRows.length === 0) return res.status(400).json({ success: false, message: `Categorie "${categorie}" introuvable` });
      categorie_id = catRows[0].id;
    }

    if (photo && photo.startsWith("data:image")) {
      photo = saveBase64Image(photo, path.join(__dirname, "..", "uploads", "menu"));
    }

    const [result] = await pool.query(
      "INSERT INTO produits_menu (categorie_id, nom, description, prix, type_poste, dispo, bestseller, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [categorie_id, nom.trim(), description?.trim() || null, prix, type_poste, dispo !== false ? 1 : 0, bestseller ? 1 : 0, photo?.trim() || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Erreur create produit:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Sub-routes (MUST be before generic :id routes) ──

// POST /api/menu/produits/:id/photo — upload image via file
router.post("/produits/:id/photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Aucune image" });
    const { id } = req.params;
    const photoPath = "/uploads/menu/" + req.file.filename;
    const [existing] = await pool.query("SELECT photo FROM produits_menu WHERE id = ?", [id]);
    if (existing.length > 0 && existing[0].photo) {
      const oldPath = path.join(__dirname, "..", existing[0].photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await pool.query("UPDATE produits_menu SET photo = ? WHERE id = ?", [photoPath, id]);
    res.json({ success: true, photo: photoPath });
  } catch (err) {
    console.error("Erreur upload photo:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// DELETE /api/menu/produits/:id/photo
router.delete("/produits/:id/photo", async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT photo FROM produits_menu WHERE id = ?", [req.params.id]);
    if (existing.length > 0 && existing[0].photo) {
      const oldPath = path.join(__dirname, "..", existing[0].photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await pool.query("UPDATE produits_menu SET photo = NULL WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Photo supprimee" });
  } catch (err) {
    console.error("Erreur delete photo:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/menu/produits/:id/bestseller
router.patch("/produits/:id/bestseller", async (req, res) => {
  try {
    const { bestseller } = req.body;
    await pool.query("UPDATE produits_menu SET bestseller = ? WHERE id = ?", [bestseller ? 1 : 0, req.params.id]);
    res.json({ success: true, bestseller });
  } catch (err) {
    console.error("Erreur toggle bestseller:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PUT /api/menu/produits/:id/dispo
router.put("/produits/:id/dispo", async (req, res) => {
  try {
    const { dispo } = req.body;
    await pool.query("UPDATE produits_menu SET dispo = ? WHERE id = ?", [dispo ? 1 : 0, req.params.id]);
    res.json({ success: true, dispo });
  } catch (err) {
    console.error("Erreur update dispo:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Generic :id routes (MUST be after sub-routes) ──

// PUT /api/menu/produits/:id
router.put("/produits/:id", validate(updateProduitSchema), async (req, res) => {
  try {
    const { categorie_id: reqCategorieId, nom, description, prix, type_poste, dispo, bestseller, photo: reqPhoto } = req.body;
    let photo = reqPhoto;
    let categorieId = reqCategorieId;
    const fields = [];
    const values = [];
    if (categorieId !== undefined)    { fields.push("categorie_id = ?"); values.push(categorieId); }
    if (nom !== undefined) {
      if (typeof nom !== "string" || nom.trim() === "") return res.status(400).json({ success: false, message: "Nom invalide" });
      fields.push("nom = ?"); values.push(nom.trim());
    }
    if (description !== undefined)     { fields.push("description = ?"); values.push(description?.trim() || null); }
    if (prix !== undefined) {
      if (typeof prix !== "number" || isNaN(prix) || prix < 0) return res.status(400).json({ success: false, message: "Prix invalide" });
      fields.push("prix = ?"); values.push(prix);
    }
    if (type_poste !== undefined) {
      if (type_poste !== "bar") return res.status(400).json({ success: false, message: "Type invalide, doit etre 'bar'" });
      fields.push("type_poste = ?"); values.push(type_poste);
    }
    if (dispo !== undefined)           { fields.push("dispo = ?"); values.push(dispo ? 1 : 0); }
    if (bestseller !== undefined)      { fields.push("bestseller = ?"); values.push(bestseller ? 1 : 0); }
    if (photo !== undefined) {
      if (typeof photo === "string" && photo.startsWith("data:image")) {
        const uploadDir = path.join(__dirname, "..", "uploads", "menu");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const mimeMatch = photo.match(/^data:(image\/\w+);base64,/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const extMap = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
        const ext = extMap[mime] || ".jpg";
        const [existingRows] = await pool.query("SELECT photo FROM produits_menu WHERE id = ?", [req.params.id]);
        if (existingRows.length > 0 && existingRows[0].photo) {
          const oldPath = path.join(__dirname, "..", existingRows[0].photo);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        const base64Data = photo.replace(/^data:(image\/\w+);base64,/, "");
        const filename = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, "base64"));
        photo = "/uploads/menu/" + filename;
      }
      fields.push("photo = ?");
      values.push(photo?.trim() || null);
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: "Aucun champ a modifier" });
    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE produits_menu SET ${fields.join(", ")} WHERE id = ?`, values);
    res.json({ success: true, affected: result.affectedRows });
  } catch (err) {
    console.error("Erreur update produit:", err.message, err.stack);
    res.status(500).json({ success: false, message: "Erreur serveur", detail: err.message });
  }
});

// DELETE /api/menu/produits/:id
router.delete("/produits/:id", async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT photo FROM produits_menu WHERE id = ?", [req.params.id]);
    if (existing.length > 0 && existing[0].photo) {
      const photoPath = path.join(__dirname, "..", existing[0].photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }
    await pool.query("DELETE FROM produits_menu WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Produit supprimé" });
  } catch (err) {
    console.error("Erreur delete produit:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/menu/produits/:id
router.get("/produits/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nom AS categorie_nom, c.type_poste AS categorie_type
       FROM produits_menu p
       LEFT JOIN categories c ON p.categorie_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Produit non trouve" });
    res.json({ success: true, produit: rows[0] });
  } catch (err) {
    console.error("Erreur get produit:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
