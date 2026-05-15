const pool = require("../config/db");

async function migrate() {
  try {
    const [tables] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'utilisateurs' AND COLUMN_NAME = 'first_login'"
    );
    if (tables.length > 0) {
      console.log("Colonne first_login deja existante, rien a faire");
    } else {
      await pool.query("ALTER TABLE utilisateurs ADD COLUMN first_login BOOLEAN DEFAULT FALSE");
      console.log("Colonne first_login ajoutee");
      await pool.query("UPDATE utilisateurs SET first_login = FALSE WHERE first_login IS NULL");
      console.log("Valeurs par defaut mises a jour");
    }
    process.exit(0);
  } catch (err) {
    console.error("Erreur migration:", err.message);
    process.exit(1);
  }
}

migrate();
