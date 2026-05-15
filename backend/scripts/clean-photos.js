const pool = require("../config/db");

async function clean() {
  try {
    const [rows] = await pool.query("SELECT id, nom, photo, LENGTH(photo) as len FROM produits_menu WHERE photo IS NOT NULL");
    console.log("Produits avec photo:", rows.length);
    for (const row of rows) {
      console.log(`  id=${row.id} nom="${row.nom}" len=${row.len} starts=data:${row.photo?.startsWith("data:image")}`);
    }
    if (rows.length === 0) {
      console.log("Rien à nettoyer.");
      process.exit(0);
    }
    const [result] = await pool.query("UPDATE produits_menu SET photo = NULL WHERE photo LIKE 'data:image%'");
    console.log("Mis à NULL:", result.affectedRows);

    // Verify
    const [afterRows] = await pool.query("SELECT id, nom, photo FROM produits_menu WHERE photo IS NOT NULL");
    console.log("Après: " + afterRows.length + " produits avec photo");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clean();
