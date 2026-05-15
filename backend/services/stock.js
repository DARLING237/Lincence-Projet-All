/**
 * Stock Service
 * Décrémente automatiquement le stock des matières premières
 * quand une commande est passée.
 */
const pool = require("../config/db");

/**
 * Mapping ingrédients par cocktail/boisson.
 * À ajuster selon vos recettes réelles.
 */
const RECETTE_INGREDIENTS = {
  // Cocktails
  1: { 13: 0.05, 1: 0.02, 2: 0.03, 4: 0.01 }, // Mojito Camer: rhum, menthe, citron vert, sucre
  2: { 17: 0.03, 18: 0.10 },                  // Spritz Douala: Aperol, prosecco
  3: { 16: 0.04, 22: 0.02, 2: 0.02, 21: 0.02 }, // Dawa Tropical: vodka, litchi, citron vert, fruits de la passion
  4: { 15: 0.10, 21: 0.02, 22: 0.02, 4: 0.01 }, // Sangria BarResto: vin rouge, fruits de la passion, litchi, sucre
  5: { 13: 0.04 },                            // Pina Colada: rhum (only)
  6: {},                                      // Caipirinha: missing cachaca
  7: {},                                      // Cocktail BarResto: secret
  8: { 1: 0.02, 2: 0.03, 4: 0.01 },          // Virgin Mojito: menthe, citron vert, sucre
  9: { 3: 0.02, 1: 0.01, 2: 0.02 },          // Gingembre Fizz: gingembre, menthe, citron vert
  // Beers
  10: { 5: 1/24 },                            // Mutzig (65cl)
  11: { 6: 1/24 },                            // 33 Export (65cl)
  12: { 7: 1/24 },                            // Beaufort (65cl)
  13: {},                                     // Isenbeck (33cl) - no stock mapping
  14: { 5: 1/24 },                            // Mutzig Blonde (33cl)
  15: { 6: 1/24 },                            // 33 Export (33cl)
  16: { 7: 1/24 },                            // Beaufort Special (50cl)
  17: { 8: 1/20 },                            // Guinness (50cl)
  // Soft drinks
  26: { 9: 1/24 },                            // Top Mangue
  27: { 9: 1/24 },                            // Top Orange
  28: { 9: 1/24 },                            // Top Ananas
  29: { 10: 1/24 },                           // Coca-Cola (50cl)
  30: { 11: 1/24 },                           // Fanta Orange
  31: {},                                     // Canada Dry - no stock mapping
  // Fresh juices
  32: { 3: 0.04, 4: 0.01 },                   // Jus de Gingembre: gingembre, sucre
  33: {},                                     // Jus de Bissap - missing bissap
  34: {},                                     // Jus de Baobab - missing baobab
  35: {},                                     // Jus de Corossol - missing corossol
  // Eaux
  36: { 12: 1/20 },                           // Eau Mingua (50cl)
  37: {},                                     // Eau Mingua (1.5L) - no stock
  38: {},                                     // Eau Gazeuse (50cl) - no stock
  39: {},                                     // Eau St-Yorres (50cl) - no stock
};

/**
 * Décrémente le stock quand une commande est créée
 * @param {Array} items - [{ produit_menu_id, quantite }]
 */
async function decrementerStockCommande(items, conn) {
  const db = conn || pool;

  for (const item of items) {
    const ingredients = RECETTE_INGREDIENTS[item.produit_menu_id];
    if (!ingredients) continue;

    for (const [stockId, qtyParUnite] of Object.entries(ingredients)) {
      const qteTotale = qtyParUnite * item.quantite;

      await db.query(
        "UPDATE produits_stock SET stock_actuel = stock_actuel - ? WHERE id = ?",
        [qteTotale, stockId]
      );

      await db.query(
        "INSERT INTO mouvements_stock (produit_stock_id, type, quantite, raison, reference_id) VALUES (?, 'sortie', ?, ?, ?)",
        [stockId, qteTotale, `Commande produit_menu_id #${item.produit_menu_id}`, item.commande_id || null]
      );

      // Mettre l'alerte si stock < min
      await db.query(
        "UPDATE produits_stock SET alerte = TRUE WHERE stock_actuel <= stock_min AND id = ?",
        [stockId]
      );
    }
  }
}

/**
 * Vérifier si le stock est suffisant avant de créer une commande
 */
async function verifierStockSuffisant(items, conn) {
  const db = conn || pool;

  for (const item of items) {
    const ingredients = RECETTE_INGREDIENTS[item.produit_menu_id];
    if (!ingredients) continue;

    for (const [stockId, qtyParUnite] of Object.entries(ingredients)) {
      const qteTotale = qtyParUnite * item.quantite;
      const [rows] = await db.query(
        "SELECT stock_actuel, nom FROM produits_stock WHERE id = ?",
        [stockId]
      );
      if (rows.length > 0 && rows[0].stock_actuel < qteTotale) {
        return {
          ok: false,
          message: `Stock insuffisant: ${rows[0].nom} (disponible: ${rows[0].stock_actuel}, besoin: ${qteTotale})`,
        };
      }
    }
  }
  return { ok: true };
}

module.exports = { decrementerStockCommande, verifierStockSuffisant };
