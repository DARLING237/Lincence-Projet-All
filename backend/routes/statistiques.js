const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// ── Statistiques Admin ──
router.get("/admin", async (req, res) => {
  try {
    const now = new Date();
    const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMois = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    // Stats transactions mois courant
    const [caRows] = await pool.query(
      "SELECT COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) AS ca, COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0) AS depenses FROM transactions WHERE date IS NOT NULL AND DATE_FORMAT(date, '%Y-%m') = ?",
      [moisCourant]
    );

    const [cmdRows] = await pool.query(
      "SELECT COUNT(*) AS nombreCommandes, COALESCE(AVG(total), 0) AS panierMoyen FROM commandes WHERE date IS NOT NULL AND DATE_FORMAT(date, '%Y-%m') = ?",
      [moisCourant]
    );

  const [prevCa] = await pool.query(
    "SELECT COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) AS ca, COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0) AS depenses FROM transactions WHERE DATE_FORMAT(date, '%Y-%m') = ?",
    [prevMois]
  );

  const [prevCmd] = await pool.query(
    "SELECT COUNT(*) AS nombreCommandes FROM commandes WHERE DATE_FORMAT(date, '%Y-%m') = ?",
    [prevMois]
  );

  const [tables] = await pool.query("SELECT COUNT(*) AS total FROM tables_salle");
  const [tablesOcc] = await pool.query("SELECT COUNT(*) AS occupees FROM tables_salle WHERE statut = 'occupee'");

  const [depFourn] = await pool.query(
    "SELECT COALESCE(SUM(montant), 0) AS total FROM transactions WHERE type_op = 'sortie' AND categorie = 'Ravitaillement' AND DATE_FORMAT(date, '%Y-%m') = ?",
    [moisCourant]
  );
  const [depSal] = await pool.query(
    "SELECT COALESCE(SUM(montant), 0) AS total FROM transactions WHERE type_op = 'sortie' AND categorie = 'Salaires' AND DATE_FORMAT(date, '%Y-%m') = ?",
    [moisCourant]
  );
  const [depImp] = await pool.query(
    "SELECT COALESCE(SUM(montant), 0) AS total FROM transactions WHERE type_op = 'sortie' AND (categorie = 'Impots' OR categorie = 'Imp\u00f4ts') AND DATE_FORMAT(date, '%Y-%m') = ?",
    [moisCourant]
  );

  const [recent_cmds] = await pool.query(
    "SELECT c.id, c.statut, c.total, c.heure, c.date, t.numero AS table_nom, u.prenom AS serveur, u.nom AS serveur_nom FROM commandes c LEFT JOIN tables_salle t ON c.table_id = t.id LEFT JOIN utilisateurs u ON c.serveur_id = u.id ORDER BY c.id DESC LIMIT 10"
  );

  const [alertes] = await pool.query(
    "SELECT * FROM produits_stock WHERE stock_actuel < stock_min ORDER BY nom"
  );

  const ca = parseFloat(caRows[0].ca) || 0;
  const depenses = parseFloat(caRows[0].depenses) || 0;

  res.json({
    success: true,
    stats: {
      ca, depenses,
      benefice: ca - depenses,
      nombreCommandes: parseInt(cmdRows[0].nombreCommandes) || 0,
      panierMoyen: parseFloat(cmdRows[0].panierMoyen) || 0,
      tablesOccupees: parseInt(tablesOcc[0].occupees) || 0,
      tablesTotal: parseInt(tables[0].total) || 0,
      caMoisPrecedent: parseFloat(prevCa[0].ca) || 0,
      depensesMoisPrecedent: parseFloat(prevCa[0].depenses) || 0,
      beneficeMoisPrecedent: (parseFloat(prevCa[0].ca) || 0) - (parseFloat(prevCa[0].depenses) || 0),
      nombreCommandesMoisPrecedent: parseInt(prevCmd[0].nombreCommandes) || 0,
      margeBrute: ca > 0 ? (((ca - depenses) / ca) * 100).toFixed(1) : 0,
      depensesFournisseurs: parseFloat(depFourn[0].total) || 0,
      depensesStaff: parseFloat(depSal[0].total) || 0,
      depensesImpots: parseFloat(depImp[0].total) || 0,
    },
    commandes_recentes: recent_cmds,
    alertes_stock: alertes,
  });
  } catch (err) {
    console.error("❌ STATS ADMIN ERROR:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Stats journalier (staff) ──
router.get("/journalier", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [cmdRows] = await pool.query(
      "SELECT COUNT(*) AS commandes, COALESCE(SUM(total), 0) AS ca FROM commandes WHERE date = ?",
      [today]
    );

    const [prevCmd] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) AS ca FROM commandes WHERE date = DATE_SUB(?, INTERVAL 1 DAY)",
      [today]
    );

    const [prep] = await pool.query(
      "SELECT COALESCE(AVG(total), 0) AS panier_moyen FROM commandes WHERE date = ?",
      [today]
    );

    res.json({
      success: true,
      stats: {
        commandesDuJour: parseInt(cmdRows[0].commandes) || 0,
        caJour: parseFloat(cmdRows[0].ca) || 0,
        caJourPrecedent: parseFloat(prevCmd[0].ca) || 0,
        panierMoyen: parseFloat(prep[0].panier_moyen) || 0,
      },
    });
  } catch (err) {
    console.error("Erreur stats journalier:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Chiffre d'affaires mensuel ──
router.get("/chiffre-affaires", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%b') AS mois,
              DATE_FORMAT(date, '%Y-%m') AS periode,
              COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) AS ca,
              COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0) AS depenses
       FROM transactions
       WHERE date IS NOT NULL
       GROUP BY DATE_FORMAT(date, '%Y-%m'), DATE_FORMAT(date, '%b')
       ORDER BY DATE_FORMAT(date, '%Y-%m')
       LIMIT 12`
    );
    res.json({ success: true, revenus: rows });
  } catch (err) {
    console.error("Erreur chiffre-affaires:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Commandes par heure ──
router.get("/commandes-par-heure", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(heure, '%Hh') AS heure,
              COUNT(*) AS commandes
       FROM commandes
       WHERE heure IS NOT NULL
       GROUP BY DATE_FORMAT(heure, '%Hh')
       ORDER BY heure`
    );
    res.json({ success: true, commandesHeure: rows });
  } catch (err) {
    console.error("Erreur commandes-par-heure:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── Rapport detaille (journalier/mensuel/annuel) ──
router.get("/rapport", async (req, res) => {
  try {
    const { period, date } = req.query;
    const requestedDate = date ? new Date(date) : new Date();

    let dateCond = "", datePrevCond = "", params = [], prevParams = [];

    if (period === "journalier") {
      const d = requestedDate.toISOString().split("T")[0];
      dateCond = "WHERE date = ?";
      datePrevCond = "WHERE date = DATE_SUB(?, INTERVAL 1 DAY)";
      params = [d];
      prevParams = [d];
    } else if (period === "mensuel") {
      const m = `${requestedDate.getFullYear()}-${String(requestedDate.getMonth() + 1).padStart(2, "0")}`;
      dateCond = "WHERE DATE_FORMAT(date, '%Y-%m') = ?";
      const pm = new Date(requestedDate.getFullYear(), requestedDate.getMonth() - 1, 1);
      const pmStr = `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, "0")}`;
      datePrevCond = "WHERE DATE_FORMAT(date, '%Y-%m') = ?";
      params = [m];
      prevParams = [pmStr];
    } else if (period === "annuel") {
      const y = String(requestedDate.getFullYear());
      dateCond = "WHERE YEAR(date) = ?";
      datePrevCond = "WHERE YEAR(date) = YEAR(DATE_SUB(?, INTERVAL 1 YEAR))";
      params = [y];
      prevParams = [requestedDate.toISOString()];
    } else {
      // Default: aujourd'hui
      const today = requestedDate.toISOString().split("T")[0];
      dateCond = "WHERE date = ?";
      datePrevCond = "WHERE date = DATE_SUB(?, INTERVAL 1 DAY)";
      params = [today];
      prevParams = [today];
    }

    // CA from transactions
    const [caRows] = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) AS ca,
              COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0) AS depenses
       FROM transactions ${dateCond}`,
      params
    );

    // Commandes stats
    const [cmdRows] = await pool.query(
      `SELECT COUNT(*) AS nb,
              COALESCE(SUM(total), 0) AS total_cmd,
              COALESCE(AVG(total), 0) AS panier_moyen
       FROM commandes ${dateCond}`,
      params
    );

    // Stats periode precedente
    const [prevCa] = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) AS ca,
              COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0) AS depenses
       FROM transactions ${datePrevCond}`,
      prevParams
    );

    const [prevCmd] = await pool.query(
      `SELECT COUNT(*) AS nb, COALESCE(SUM(total), 0) AS total_cmd
       FROM commandes ${datePrevCond}`,
      prevParams
    );

    const ca = parseFloat(caRows[0].ca) || 0;
    const depenses = parseFloat(caRows[0].depenses) || 0;
    const benefice = ca - depenses;
    const prevCaMontant = parseFloat(prevCa[0].ca) || 0;
    const prevDepenses = parseFloat(prevCa[0].depenses) || 0;
    const prevBenefice = prevCaMontant - prevDepenses;

    const caTaux = prevCaMontant > 0 ? (((ca - prevCaMontant) / Math.abs(prevCaMontant)) * 100).toFixed(1) : null;
    const benefTaux = prevBenefice !== 0 ? (((benefice - prevBenefice) / Math.abs(prevBenefice)) * 100).toFixed(1) : null;

    // Paiements par methode — note: mode_paiement may not exist in DB yet
    let paiementsParMode = [];
    try {
      const [rows] = await pool.query(
        `SELECT c.mode_paiement, COUNT(*) AS nb, SUM(c.total) AS total
         FROM commandes c
         ${dateCond} AND c.mode_paiement IS NOT NULL AND c.statut = 'payee'
         GROUP BY c.mode_paiement`,
        params
      );
      paiementsParMode = rows;
    } catch(e) {
      // mode_paiement column doesn't exist — return empty
      console.warn('⚠️ mode_paiement column not found in commandes, skipping paiementsParMode');
    }

    // Ventes par categorie de produit — wrap in try/catch in case JOIN fails
    let ventesParCat = [];
    try {
      const [rows] = await pool.query(
        `SELECT c.nom AS categorie, c.type_poste,
                COUNT(*) AS nb_ventes,
                SUM(ci.prix_unitaire * ci.quantite) AS total
         FROM commande_items ci
         JOIN produits_menu p ON ci.produit_menu_id = p.id
         JOIN categories c ON p.categorie_id = c.id
         JOIN commandes cmd ON ci.commande_id = cmd.id
         ${dateCond.replace("date", "cmd.date")} AND ci.statut != 'annule'
         GROUP BY c.nom, c.type_poste
         ORDER BY total DESC`,
        params
      );
      ventesParCat = rows;
    } catch(e) {
      console.warn('⚠️ ventesParCat query failed:', e.message);
    }

    // Top produits — wrap in try/catch
    let topProduits = [];
    try {
      const [rows] = await pool.query(
        `SELECT p.nom, c.nom AS categorie,
                SUM(ci.quantite) AS quantite_totale,
                SUM(ci.prix_unitaire * ci.quantite) CA
         FROM commande_items ci
         JOIN produits_menu p ON ci.produit_menu_id = p.id
         JOIN categories c ON p.categorie_id = c.id
         JOIN commandes cmd ON ci.commande_id = cmd.id
         ${dateCond.replace("date", "cmd.date")} AND ci.statut != 'annule'
         GROUP BY p.id, p.nom, c.nom
         ORDER BY quantite_totale DESC
         LIMIT 10`,
        params
      );
      topProduits = rows;
    } catch(e) {
      console.warn('⚠️ topProduits query failed:', e.message);
    }

    // Commandes par heure — wrap in try/catch
    let parHeure = [];
    try {
      const [rows] = await pool.query(
        `SELECT DATE_FORMAT(cmd.heure, '%Hh') AS heure,
                COUNT(*) AS commandes,
                COALESCE(SUM(cmd.total), 0) AS CA
         FROM commandes cmd
         ${dateCond.replace("date", "cmd.date")}
         GROUP BY DATE_FORMAT(cmd.heure, '%Hh'), cmd.heure
         ORDER BY cmd.heure`,
        params
      );
      parHeure = rows;
    } catch(e) {
      console.warn('⚠️ parHeure query failed:', e.message);
    }

    // Liste des commandes du period — note: mode_paiement may not exist
    let listeCommandes = [];
    try {
      const [rows] = await pool.query(
        `SELECT c.id, c.statut, c.total, c.heure, c.date, c.source,
                t.numero AS table_numero,
                u.prenom AS serveur_prenom, u.nom AS serveur_nom
         FROM commandes c
         LEFT JOIN tables_salle t ON c.table_id = t.id
         LEFT JOIN utilisateurs u ON c.serveur_id = u.id
         ${dateCond}
         ORDER BY c.id DESC`,
        params
      );
      listeCommandes = rows;
    } catch(e) {
      console.warn('⚠️ listeCommandes query failed:', e.message);
    }

    res.json({
      success: true,
      rapport: {
        period,
        date: requestedDate.toISOString().split("T")[0],
        ca,
        depenses,
        benefice,
        nombreCommandes: parseInt(cmdRows[0].nb) || 0,
        panierMoyen: parseFloat(cmdRows[0].panier_moyen) || 0,
        caMoisPrecedent: prevCaMontant,
        depensesMoisPrecedent: prevDepenses,
        beneficeMoisPrecedent: prevBenefice,
        caTauxProgression: caTaux,
        beneficeTauxProgression: benefTaux,
        paiementsParMode,
        ventesParCategorie: ventesParCat,
        topProduits,
        commandesParHeure: parHeure,
        listeCommandes,
      },
    });
  } catch (err) {
    console.error("Erreur rapport:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
