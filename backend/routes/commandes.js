const express = require("express");
const pool = require("../config/db");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { z } = require("zod");
const { collectPayment, checkTransaction, getBalance } = require("../services/campay");
const { decrementerStockCommande, verifierStockSuffisant } = require("../services/stock");
const router = express.Router();

const commandeItemSchema = z.object({
  produit_menu_id: z.number().int("produit_menu_id doit etre un entier"),
  quantite: z.number().int("quantite doit etre un entier").min(1, "quantite doit etre >= 1"),
  prix_unitaire: z.number().min(0, "prix_unitaire doit etre >= 0"),
  type_poste: z.string().min(1, "type_poste requis"),
});

const createCommandeSchema = z.object({
  table_id: z.number().int().optional(),
  table_numero: z.string().optional(),
  serveur_id: z.number().int().optional(),
  items: z.array(commandeItemSchema).min(1, "Au moins un article requis"),
  source: z.string().optional(),
  note: z.string().optional(),
});

const statutCommandeSchema = z.object({
  statut: z.string().min(1, "Statut requis"),
});

// ===== ROUTES SPÉCIFIQUES (doivent être AVANT /:id) =====

// GET /api/commandes/empty - Vérifier si commande vide (utilisé par le frontend)
router.get("/empty", async (req, res) => {
  res.json({ success: true, empty: true });
});

// GET /api/commandes - Liste des commandes avec filtres
router.get("/", async (req, res) => {
  try {
    const { statut, date, table_id, source } = req.query;
    let sql = "SELECT c.*, t.numero AS table_nom, t.numero AS table_numero, u.prenom AS serveur, u.prenom AS serveur_prenom, u.nom AS serveur_nom, TIMESTAMPDIFF(MINUTE, c.heure, CURTIME()) AS temps FROM commandes c LEFT JOIN tables_salle t ON c.table_id = t.id LEFT JOIN utilisateurs u ON c.serveur_id = u.id WHERE 1=1";
    const params = [];

    if (statut) { sql += " AND c.statut = ?"; params.push(statut); }
    if (date) { sql += " AND c.date = ?"; params.push(date); }
    if (table_id) { sql += " AND c.table_id = ?"; params.push(table_id); }
    if (source) { sql += " AND c.source = ?"; params.push(source); }

    sql += " ORDER BY c.id DESC";
    const [rows] = await pool.query(sql, params);

    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const [items] = await pool.query(
        "SELECT ci.*, ci.quantite AS qte, p.nom AS nom, p.nom AS produit_nom FROM commande_items ci LEFT JOIN produits_menu p ON ci.produit_menu_id = p.id WHERE ci.commande_id IN (?) ORDER BY ci.id",
        [ids]
      );
      rows.forEach((cmd) => {
        cmd.items = items.filter((i) => i.commande_id === cmd.id);
      });
    }

    res.json({ success: true, commandes: rows });
  } catch (err) {
    console.error("Erreur get commandes:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/commandes/en-cours
router.get("/en-cours", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT c.*, t.numero AS table_nom, t.numero AS table_numero, u.prenom AS serveur, u.prenom AS serveur_prenom, u.nom AS serveur_nom, TIMESTAMPDIFF(MINUTE, c.heure, CURTIME()) AS temps FROM commandes c LEFT JOIN tables_salle t ON c.table_id = t.id LEFT JOIN utilisateurs u ON c.serveur_id = u.id WHERE c.statut IN ('en attente', 'en preparation', 'servie') ORDER BY c.id DESC"
    );

    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const [items] = await pool.query(
        "SELECT ci.*, ci.quantite AS qte, p.nom AS nom, p.nom AS produit_nom FROM commande_items ci LEFT JOIN produits_menu p ON ci.produit_menu_id = p.id WHERE ci.commande_id IN (?) ORDER BY ci.id",
        [ids]
      );
      rows.forEach((cmd) => {
        cmd.items = items.filter((i) => i.commande_id === cmd.id);
      });
    }

    res.json({ success: true, commandes: rows });
  } catch (err) {
    console.error("Erreur get commandes en-cours:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/commandes/items/bar
router.get("/items/bar", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT ci.id, ci.commande_id, ci.quantite, ci.prix_unitaire, ci.statut, ci.produit_menu_id, ci.type_poste, p.nom AS produit_nom, c.table_id, t.numero AS table_numero, c.statut AS cmd_statut, u.prenom AS serveur_prenom FROM commande_items ci JOIN produits_menu p ON ci.produit_menu_id = p.id JOIN commandes c ON ci.commande_id = c.id LEFT JOIN tables_salle t ON c.table_id = t.id LEFT JOIN utilisateurs u ON c.serveur_id = u.id WHERE ci.type_poste = 'bar' AND ci.statut IN ('en attente', 'en preparation', 'pret') ORDER BY ci.commande_id"
    );
    res.json({ success: true, items: rows });
  } catch (err) {
    console.error("Erreur get items bar:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/commandes
router.post("/", validate(createCommandeSchema), async (req, res) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const { table_id, table_numero, serveur_id, items, source, note } = req.body;

    // Résoudre table_id à partir du numéro si fourni
    let resolvedTableId = table_id;
    if (!resolvedTableId && table_numero) {
      const [tables] = await conn.query("SELECT id FROM tables_salle WHERE numero = ?", [table_numero]);
      if (tables.length > 0) {
        resolvedTableId = tables[0].id;
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Aucun article" });
    }

    for (const item of items) {
      if (!item.produit_menu_id || !item.quantite || !item.prix_unitaire || !item.type_poste) {
        return res.status(400).json({ success: false, message: "Donnees de commande invalides" });
      }
      if (!Number.isInteger(item.produit_menu_id) || !Number.isInteger(item.quantite) || item.quantite < 1) {
        return res.status(400).json({ success: false, message: "Quantite invalide" });
      }
    }

    const total = items.reduce((sum, item) => sum + (item.prix_unitaire * (item.quantite || 1)), 0);

    let resolvedServeurId = serveur_id;
    if (!resolvedServeurId) {
      const [serveurs] = await conn.query("SELECT id FROM utilisateurs WHERE role = 'serveur' AND actif = TRUE LIMIT 1");
      resolvedServeurId = serveurs.length > 0 ? serveurs[0].id : 1;
    }

    const [cmdResult] = await conn.query(
      "INSERT INTO commandes (table_id, serveur_id, total, heure, date, source, note) VALUES (?, ?, ?, CURTIME(), CURDATE(), ?, ?)",
      [resolvedTableId || null, resolvedServeurId, total, source || "staff", note || null]
    );

    const commandesId = cmdResult.insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO commande_items (commande_id, produit_menu_id, quantite, prix_unitaire, type_poste) VALUES (?, ?, ?, ?, ?)",
        [commandesId, item.produit_menu_id, item.quantite || 1, item.prix_unitaire, item.type_poste]
      );
    }

    // Verifier et decrementer le stock
    const stockCheck = await verifierStockSuffisant(items, conn);
    if (!stockCheck.ok) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: stockCheck.message });
    }

    await decrementerStockCommande(items.map((it) => ({ ...it, commande_id: commandesId })), conn);

    if (table_id) {
      await conn.query("UPDATE tables_salle SET statut = 'occupee' WHERE id = ? AND statut = 'libre'", [table_id]);
    }

    await conn.commit();

    const [cmd] = await pool.query("SELECT * FROM commandes WHERE id = ?", [commandesId]);
    res.status(201).json({ success: true, commande: cmd[0], commandesId });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur create commande:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

// GET /api/commandes/:id - Récupérer une commande par ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT c.*, t.numero AS table_nom FROM commandes c LEFT JOIN tables_salle t ON c.table_id = t.id WHERE c.id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Commande non trouvee" });
    }

    const commande = rows[0];

    // Récupérer les items
    const [items] = await pool.query(
      "SELECT ci.*, p.nom AS produit_nom FROM commande_items ci JOIN produits_menu p ON ci.produit_menu_id = p.id WHERE ci.commande_id = ?",
      [req.params.id]
    );

    commande.items = items;

    res.json({ success: true, commande });
  } catch (err) {
    console.error("Erreur get commande:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/commandes/:id/statut
router.patch("/:id/statut", validate(statutCommandeSchema), async (req, res) => {
  try {
    const { statut } = req.body;
    await pool.query("UPDATE commandes SET statut = ? WHERE id = ?", [statut, req.params.id]);

    if (statut === "payee" || statut === "annulee") {
      const [cmd] = await pool.query("SELECT table_id FROM commandes WHERE id = ?", [req.params.id]);
      if (cmd.length > 0 && cmd[0].table_id) {
        await pool.query("UPDATE tables_salle SET statut = 'libre' WHERE id = ?", [cmd[0].table_id]);
      }
    }

    res.json({ success: true, statut });
  } catch (err) {
    console.error("Erreur update commande statut:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/commandes/items/:id/statut
router.patch("/items/:id/statut", validate(statutCommandeSchema), async (req, res) => {
  try {
    const { statut } = req.body;
    await pool.query("UPDATE commande_items SET statut = ? WHERE id = ?", [statut, req.params.id]);
    res.json({ success: true, statut });
  } catch (err) {
    console.error("Erreur update item statut:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/commandes/items/:id/pret
router.patch("/items/:id/pret", async (req, res) => {
  try {
    await pool.query("UPDATE commande_items SET statut = 'pret' WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur mark item pret:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/commandes/:id/payer
router.post("/:id/payer", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { mode_paiement, reference, montant, num_client, campay_async } = req.body;
    const VALID_MODES = ["especes", "orange_money", "mtn_momo", "carte", "transfert"];

    if (!mode_paiement || !VALID_MODES.includes(mode_paiement)) {
      return res.status(400).json({ success: false, message: "Mode de paiement invalide. Modes: especes, orange_money, mtn_momo" });
    }

    const isMobilePayment = ["orange_money", "mtn_momo"].includes(mode_paiement);
    if (isMobilePayment && !num_client) {
      return res.status(400).json({ success: false, message: "Le numero de telephone client est requis pour ce mode de paiement" });
    }

    const [cmd] = await conn.query("SELECT * FROM commandes WHERE id = ?", [req.params.id]);
    if (cmd.length === 0) {
      return res.status(404).json({ success: false, message: "Commande non trouvee" });
    }
    const commande = cmd[0];
    const paye = montant || commande.total;

    if (isMobilePayment) {
      const campayRef = reference || null;

      if (campay_async) {
        let campayResult;
        try {
          campayResult = await collectPayment({
            phone: num_client,
            amount: paye,
            description: "Paiement commande #" + req.params.id + " - Bar",
            externalRef: "CMD-" + req.params.id,
          });
        } catch (err) {
          await conn.rollback();
          return res.status(502).json({
            success: false,
            message: "Echec de l'initiation du paiement CamPay",
            detail: err.response?.data || err.message,
          });
        }

        const [paiResult] = await conn.query(
          "INSERT INTO paiements (commande_id, mode_paiement, montant, reference, num_client, campay_reference, campay_status, campay_operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [req.params.id, mode_paiement, paye, campayRef || null, num_client, campayResult.reference, campayResult.status, campayResult.operator]
        );

        await conn.query("UPDATE commandes SET mode_paiement = ? WHERE id = ?", [mode_paiement, req.params.id]);

        await conn.commit();

        return res.json({
          success: true,
          paiementId: paiResult.insertId,
          campay: {
            reference: campayResult.reference,
            status: campayResult.status,
            operator: campayResult.operator,
            ussd_code: campayResult.ussd_code || null,
          },
          message: "Paiement initie. Le client doit approuver via USSD.",
        });
      }

      // Mode synchrone
      const [paiResult] = await conn.query(
        "INSERT INTO paiements (commande_id, mode_paiement, montant, reference, num_client) VALUES (?, ?, ?, ?, ?)",
        [req.params.id, mode_paiement, paye, reference || null, num_client]
      );

      await conn.query("UPDATE commandes SET statut = 'payee', mode_paiement = ? WHERE id = ?", [mode_paiement, req.params.id]);

      await conn.query(
        "INSERT INTO transactions (type_op, categorie, montant, reference, description, date) VALUES ('entree', 'Vente caisse', ?, ?, ?, CURDATE())",
        [paye, "CMD-" + req.params.id, "Paiement " + mode_paiement + " commande #" + req.params.id]
      );

      if (commande.table_id) {
        await conn.query("UPDATE tables_salle SET statut = 'libre' WHERE id = ? AND statut = 'occupee'", [commande.table_id]);
      }

      await conn.commit();
      return res.json({ success: true, paiementId: paiResult.insertId });
    }

    // Paiement direct (especes, carte, transfert)
    const [paiResult] = await conn.query(
      "INSERT INTO paiements (commande_id, mode_paiement, montant, reference) VALUES (?, ?, ?, ?)",
      [req.params.id, mode_paiement, paye, reference || null]
    );

    await conn.query("UPDATE commandes SET statut = 'payee', mode_paiement = ? WHERE id = ?", [mode_paiement, req.params.id]);

    await conn.query(
      "INSERT INTO transactions (type_op, categorie, montant, reference, description, date) VALUES ('entree', 'Vente caisse', ?, ?, ?, CURDATE())",
      [paye, "CMD-" + req.params.id, "Paiement " + mode_paiement + " commande #" + req.params.id]
    );

    if (commande.table_id) {
      await conn.query("UPDATE tables_salle SET statut = 'libre' WHERE id = ? AND statut = 'occupee'", [commande.table_id]);
    }

    await conn.commit();
    res.json({ success: true, paiementId: paiResult.insertId });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur paiement:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

// GET /api/commandes/:id/recu
router.get("/:id/recu", async (req, res) => {
  try {
    const [cmd] = await pool.query(
      "SELECT c.*, t.numero AS table_numero, u.prenom AS serveur_prenom, u.nom AS serveur_nom FROM commandes c LEFT JOIN tables_salle t ON c.table_id = t.id LEFT JOIN utilisateurs u ON c.serveur_id = u.id WHERE c.id = ?",
      [req.params.id]
    );
    if (cmd.length === 0) return res.status(404).json({ success: false, message: "Commande non trouvee" });

    const [items] = await pool.query(
      "SELECT ci.*, p.nom AS produit_nom, c.nom AS categorie FROM commande_items ci JOIN produits_menu p ON ci.produit_menu_id = p.id LEFT JOIN categories c ON p.categorie_id = c.id WHERE ci.commande_id = ?",
      [req.params.id]
    );

    const [paiements] = await pool.query(
      "SELECT * FROM paiements WHERE commande_id = ? ORDER BY date_paiement",
      [req.params.id]
    );

    res.json({ success: true, recu: { commande: cmd[0], items, paiements, total: cmd[0].total, date: new Date().toLocaleDateString("fr-FR"), heure: new Date().toLocaleTimeString("fr-FR") } });
  } catch (err) {
    console.error("Erreur recu:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// DELETE /api/commandes/:id
router.delete("/:id", async (req, res) => {
  try {
    const [cmd] = await pool.query("SELECT table_id FROM commandes WHERE id = ?", [req.params.id]);
    if (cmd.length > 0 && cmd[0].table_id) {
      await pool.query("UPDATE tables_salle SET statut = 'libre' WHERE id = ?", [cmd[0].table_id]);
    }
    await pool.query("DELETE FROM commandes WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Commande supprimee" });
  } catch (err) {
    console.error("Erreur delete commande:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/commandes/:id/payer/verify
router.post("/:id/payer/verify", async (req, res) => {
  try {
    const [paiements] = await pool.query(
      "SELECT * FROM paiements WHERE commande_id = ? AND campay_reference IS NOT NULL ORDER BY date_paiement DESC LIMIT 1",
      [req.params.id]
    );

    if (paiements.length === 0) {
      return res.status(404).json({ success: false, message: "Aucun paiement CamPay trouve" });
    }

    const paiement = paiements[0];

    if (paiement.campay_status === "SUCCESSFUL") {
      return res.json({ success: true, status: "SUCCESSFUL", paiement, message: "Paiement deja confirme" });
    }

    const campayResult = await checkTransaction(paiement.campay_reference);

    await pool.query("UPDATE paiements SET campay_status = ? WHERE id = ?", [campayResult.status, paiement.id]);

    if (campayResult.status === "SUCCESSFUL") {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query("UPDATE commandes SET statut = 'payee' WHERE id = ?", [req.params.id]);

        const [cmd] = await conn.query("SELECT * FROM commandes WHERE id = ?", [req.params.id]);
        if (cmd.length > 0 && cmd[0].table_id) {
          await conn.query("UPDATE tables_salle SET statut = 'libre' WHERE id = ? AND statut = 'occupee'", [cmd[0].table_id]);
        }

        await conn.query(
          "INSERT INTO transactions (type_op, categorie, montant, reference, description, date) VALUES ('entree', 'Vente caisse', ?, ?, ?, CURDATE())",
          [paiement.montant, "CMD-" + req.params.id, "Paiement " + paiement.mode_paiement + " via CamPay commande #" + req.params.id]
        );

        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    res.json({ success: true, status: campayResult.status, operator_reference: campayResult.operator_reference, paiement });
  } catch (err) {
    console.error("Erreur verification Campay:", err);
    res.status(500).json({ success: false, message: "Erreur verification paiement" });
  }
});

// ============================================
// NOUVELLES FONCTIONNALITÉS COMMANDES
// ============================================

// PATCH /api/commandes/:id/transferer - Transfert d'une table à une autre
router.patch("/:id/transferer", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { nouvelle_table_id } = req.body;
    const commandeId = req.params.id;

    if (!nouvelle_table_id) {
      return res.status(400).json({ success: false, message: "ID de la nouvelle table requis" });
    }

    // Récupérer la commande actuelle
    const [cmd] = await conn.query("SELECT * FROM commandes WHERE id = ?", [commandeId]);
    if (cmd.length === 0) {
      return res.status(404).json({ success: false, message: "Commande non trouvée" });
    }

    // Vérifier si la nouvelle table existe
    const [table] = await conn.query("SELECT * FROM tables_salle WHERE id = ?", [nouvelle_table_id]);
    if (table.length === 0) {
      return res.status(404).json({ success: false, message: "Table non trouvée" });
    }

    // Bloquer uniquement les tables réservées
    if (table[0].statut === 'reservee') {
      return res.status(400).json({ success: false, message: "La table de destination est réservée" });
    }

    // Libérer l'ancienne table
    if (cmd[0].table_id) {
      await conn.query("UPDATE tables_salle SET statut = 'libre' WHERE id = ?", [cmd[0].table_id]);
    }

    // Assigner la nouvelle table et la marquer occupée
    await conn.query("UPDATE commandes SET table_id = ? WHERE id = ?", [nouvelle_table_id, commandeId]);
    await conn.query("UPDATE tables_salle SET statut = 'occupee' WHERE id = ?", [nouvelle_table_id]);

    await conn.commit();
    res.json({ success: true, message: "Commande transférée à la table " + table[0].numero, nouvelle_table_id });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur transfert commande:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

// PATCH /api/commandes/:id/items/:itemId - Modifier la quantité d'un item
router.patch("/:id/items/:itemId", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { quantite } = req.body;
    const { id: commandeId, itemId } = req.params;

    if (!quantite || quantite < 0) {
      return res.status(400).json({ success: false, message: "Quantité invalide" });
    }

    // Récupérer l'item
    const [item] = await conn.query("SELECT * FROM commande_items WHERE id = ? AND commande_id = ?", [itemId, commandeId]);
    if (item.length === 0) {
      return res.status(404).json({ success: false, message: "Item non trouvé" });
    }

    const oldQuantite = item[0].quantite;

    if (quantite === 0) {
      // Supprimer l'item (annulation partielle)
      await conn.query("DELETE FROM commande_items WHERE id = ?", [itemId]);
    } else {
      // Mettre à jour la quantité
      await conn.query("UPDATE commande_items SET quantite = ? WHERE id = ?", [quantite, itemId]);
    }

    // Recalculer le total de la commande
    const [items] = await conn.query("SELECT SUM(quantite * prix_unitaire) as nouveau_total FROM commande_items WHERE commande_id = ?", [commandeId]);
    const nouveauTotal = items[0].nouveau_total || 0;

    await conn.query("UPDATE commandes SET total = ? WHERE id = ?", [nouveauTotal, commandeId]);

    // Ajuster le stock (ajouter si annulation, retirer si ajout)
    const diffQuantite = quantite - oldQuantite;
    if (diffQuantite !== 0) {
      const [produit] = await conn.query("SELECT * FROM produits_menu WHERE id = ?", [item[0].produit_menu_id]);
      if (produit.length > 0) {
        // Ajuster le stock selon le type de mouvement
        if (diffQuantite > 0) {
          // Augmentation de quantité - retrait du stock
          await decrementerStockCommande([{ ...item[0], quantite: diffQuantite, commande_id: commandeId }], conn);
        } else {
          // Diminution de quantité - rendu du stock
          await conn.query(
            "UPDATE produits_stock SET stock_actuel = stock_actuel + ? WHERE id = (SELECT ps.id FROM produits_stock ps JOIN produits_menu pm ON ps.nom = pm.nom WHERE pm.id = ? LIMIT 1)",
            [Math.abs(diffQuantite), item[0].produit_menu_id]
          );
        }
      }
    }

    await conn.commit();
    res.json({ success: true, message: "Item mis à jour", nouveau_total: nouveauTotal });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur modification item:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

// POST /api/commandes/:id/items - Ajouter un item à une commande en cours
router.post("/:id/items", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { produit_menu_id, quantite, prix_unitaire, type_poste } = req.body;
    const commandeId = req.params.id;

    if (!produit_menu_id || !quantite || !prix_unitaire || !type_poste) {
      return res.status(400).json({ success: false, message: "Données incomplètes" });
    }

    // Vérifier que la commande existe et n'est pas payée/annulée
    const [cmd] = await conn.query("SELECT * FROM commandes WHERE id = ? AND statut NOT IN ('payee', 'annulee')", [commandeId]);
    if (cmd.length === 0) {
      return res.status(404).json({ success: false, message: "Commande non trouvée ou déjà terminée" });
    }

    // Ajouter l'item
    const [result] = await conn.query(
      "INSERT INTO commande_items (commande_id, produit_menu_id, quantite, prix_unitaire, type_poste) VALUES (?, ?, ?, ?, ?)",
      [commandeId, produit_menu_id, quantite, prix_unitaire, type_poste]
    );

    // Mettre à jour le total
    const nouveauTotal = cmd[0].total + (prix_unitaire * quantite);
    await conn.query("UPDATE commandes SET total = ? WHERE id = ?", [nouveauTotal, commandeId]);

    // Décrementer le stock
    await decrementerStockCommande([{ produit_menu_id, quantite, prix_unitaire, type_poste, commande_id: commandeId }], conn);

    await conn.commit();
    res.json({ success: true, item_id: result.insertId, nouveau_total: nouveauTotal });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur ajout item:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    conn.release();
  }
});

// PATCH /api/commandes/:id/differer - Planifier une commande pour plus tard
router.patch("/:id/differer", async (req, res) => {
  try {
    const { date_prevue, heure_prevue } = req.body;
    const commandeId = req.params.id;

    if (!date_prevue || !heure_prevue) {
      return res.status(400).json({ success: false, message: "Date et heure prévues requises" });
    }

    // Vérifier que la commande existe
    const [cmd] = await pool.query("SELECT * FROM commandes WHERE id = ?", [commandeId]);
    if (cmd.length === 0) {
      return res.status(404).json({ success: false, message: "Commande non trouvée" });
    }

    // Mettre à jour la commande comme différée
    await pool.query(
      "UPDATE commandes SET est_differee = 1, date_prevue = ?, heure_prevue = ? WHERE id = ?",
      [date_prevue, heure_prevue, commandeId]
    );

    res.json({ success: true, message: "Commande différée au " + date_prevue + " à " + heure_prevue });
  } catch (err) {
    console.error("Erreur differer commande:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/commandes/:id/activer - Activer une commande différée
router.patch("/:id/activer", async (req, res) => {
  try {
    const commandeId = req.params.id;

    const [cmd] = await pool.query("SELECT * FROM commandes WHERE id = ? AND est_differee = 1", [commandeId]);
    if (cmd.length === 0) {
      return res.status(404).json({ success: false, message: "Commande différée non trouvée" });
    }

    // Activer la commande
    await pool.query(
      "UPDATE commandes SET est_differee = 0, date_prevue = NULL, heure_prevue = NULL, statut = 'en attente' WHERE id = ?",
      [commandeId]
    );

    res.json({ success: true, message: "Commande activée" });
  } catch (err) {
    console.error("Erreur activer commande:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/commandes/differees - Liste des commandes différées
router.get("/differees", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT c.*, t.numero AS table_nom, u.prenom AS serveur FROM commandes c LEFT JOIN tables_salle t ON c.table_id = t.id LEFT JOIN utilisateurs u ON c.serveur_id = u.id WHERE c.est_differee = 1 AND c.statut NOT IN ('payee', 'annulee') ORDER BY c.date_prevue, c.heure_prevue"
    );

    res.json({ success: true, commandes: rows });
  } catch (err) {
    console.error("Erreur get commandes differees:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/campay/balance
router.get("/campay/balance", authenticate, async (req, res) => {
  try {
    const balance = await getBalance();

    await pool.query(
      "UPDATE campay_solde SET total_balance = ?, orange_balance = ?, mtn_balance = ?, derniere_sync = NOW() WHERE id = 1",
      [balance.total_balance, balance.orange_balance, balance.mtn_balance]
    );

    res.json({ success: true, balance });
  } catch (err) {
    console.error("Erreur solde CamPay:", err);
    const [rows] = await pool.query("SELECT * FROM campay_solde WHERE id = 1");
    if (rows.length === 0) {
      return res.status(500).json({ success: false, message: "Impossible de recuperer le solde" });
    }
    res.json({ success: true, balance: rows[0], cached: true });
  }
});

module.exports = router;
