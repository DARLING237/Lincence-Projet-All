/**
 * Stock Service
 * Décrémente automatiquement le stock des matières premières
 * à partir de la table `recettes` en base de données quand une commande est passée.
 */
const pool = require("../config/db");

/**
 * Décrémente le stock quand une commande est créée
 * @param {Array} items - [{ produit_menu_id, quantite, commande_id }]
 * @param {Object} conn - Connexion de transaction active (optionnel)
 */
async function decrementerStockCommande(items, conn) {
  const db = conn || pool;

  for (const item of items) {
    // Récupère les ingrédients requis pour ce plat ou cette boisson depuis la BD
    const [ingredients] = await db.query(
      "SELECT produit_stock_id, quantite_requise FROM recettes WHERE produit_menu_id = ?",
      [item.produit_menu_id]
    );

    if (!ingredients || ingredients.length === 0) continue;

    for (const ing of ingredients) {
      const qteTotale = ing.quantite_requise * item.quantite;

      // 1. Décrémentation du stock actuel
      await db.query(
        "UPDATE produits_stock SET stock_actuel = stock_actuel - ? WHERE id = ?",
        [qteTotale, ing.produit_stock_id]
      );

      // 2. Enregistrement de l'historique du mouvement de stock
      await db.query(
        "INSERT INTO mouvements_stock (produit_stock_id, type, quantite, raison, reference_id, reference_type) VALUES (?, 'sortie', ?, ?, ?, 'commande')",
        [ing.produit_stock_id, qteTotale, `Commande produit_menu_id #${item.produit_menu_id}`, item.commande_id || null]
      );

      // 3. Passage en alerte si le stock descend sous le seuil minimal
      await db.query(
        "UPDATE produits_stock SET alerte = TRUE WHERE stock_actuel <= stock_min AND id = ?",
        [ing.produit_stock_id]
      );
    }
  }
}

/**
 * Vérifier si le stock de matières premières est suffisant avant de valider la commande
 * @param {Array} items - [{ produit_menu_id, quantite }]
 * @param {Object} conn - Connexion de transaction active (optionnel)
 */
async function verifierStockSuffisant(items, conn) {
  const db = conn || pool;

  for (const item of items) {
    // Récupère les matières premières nécessaires et leur nom
    const [ingredients] = await db.query(
      `SELECT r.produit_stock_id, r.quantite_requise, ps.nom AS ingredient_nom 
       FROM recettes r 
       JOIN produits_stock ps ON r.produit_stock_id = ps.id 
       WHERE r.produit_menu_id = ?`,
      [item.produit_menu_id]
    );

    if (!ingredients || ingredients.length === 0) continue;

    for (const ing of ingredients) {
      const qteTotale = ing.quantite_requise * item.quantite;
      
      const [rows] = await db.query(
        "SELECT stock_actuel, nom FROM produits_stock WHERE id = ?",
        [ing.produit_stock_id]
      );
      
      if (rows.length > 0 && Number(rows[0].stock_actuel) < qteTotale) {
        return {
          ok: false,
          message: `Stock insuffisant: ${rows[0].nom} (disponible: ${rows[0].stock_actuel} ${rows[0].unite || ''}, besoin: ${qteTotale} ${rows[0].unite || ''})`,
        };
      }
    }
  }
  return { ok: true };
}

module.exports = { decrementerStockCommande, verifierStockSuffisant };
