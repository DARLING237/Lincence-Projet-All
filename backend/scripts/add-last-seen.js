const pool = require('../config/db');
(async () => {
  try {
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'utilisateurs' AND COLUMN_NAME = 'last_seen'"
    );
    if (cols.length === 0) {
      await pool.query("ALTER TABLE utilisateurs ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      console.log("Colonne last_seen ajoutee");
    } else {
      console.log("Colonne last_seen deja existe");
    }
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
