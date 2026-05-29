const pool = require("../config/db");

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [table, column]
  );
  return rows[0].count > 0;
}

async function tableExists(conn, table) {
  const [rows] = await conn.query(
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
    [table]
  );
  return rows[0].count > 0;
}

async function addColumnIfMissing(conn, table, column, definition) {
  if (await columnExists(conn, table, column)) return;
  await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  console.log(`[schema] Added ${table}.${column}`);
}

async function ensureRuntimeSchema() {
  const conn = await pool.getConnection();
  try {
    await addColumnIfMissing(conn, "tables_salle", "places", "INT DEFAULT 2");
    await addColumnIfMissing(conn, "tables_salle", "zone", "VARCHAR(50) DEFAULT NULL");
    await addColumnIfMissing(
      conn,
      "tables_salle",
      "statut",
      "ENUM('libre','occupee','reservee') DEFAULT 'libre'"
    );
    await addColumnIfMissing(conn, "tables_salle", "qr_actif", "TINYINT(1) NOT NULL DEFAULT 1");

    await addColumnIfMissing(conn, "utilisateurs", "last_seen", "DATETIME DEFAULT NULL");

    await addColumnIfMissing(
      conn,
      "commandes",
      "mode_paiement",
      "ENUM('especes','orange_money','mtn_momo','carte','transfert') DEFAULT NULL"
    );
    await addColumnIfMissing(conn, "commandes", "source", "VARCHAR(30) DEFAULT 'staff'");
    await addColumnIfMissing(conn, "commandes", "note", "TEXT DEFAULT NULL");
    await addColumnIfMissing(conn, "commandes", "est_differee", "TINYINT(1) NOT NULL DEFAULT 0");
    await addColumnIfMissing(conn, "commandes", "date_prevue", "DATE DEFAULT NULL");
    await addColumnIfMissing(conn, "commandes", "heure_prevue", "TIME DEFAULT NULL");

    await addColumnIfMissing(
      conn,
      "commande_items",
      "statut",
      "ENUM('en attente','en preparation','pret','servi','annule') DEFAULT 'en attente'"
    );

    if (!(await tableExists(conn, "paiements"))) {
      await conn.query(`
        CREATE TABLE paiements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          commande_id INT NOT NULL,
          mode_paiement ENUM('especes','orange_money','mtn_momo','carte','transfert') NOT NULL,
          montant BIGINT NOT NULL,
          reference VARCHAR(100) DEFAULT NULL,
          num_client VARCHAR(20) DEFAULT NULL,
          campay_reference VARCHAR(100) DEFAULT NULL,
          campay_status VARCHAR(30) DEFAULT NULL,
          campay_operator VARCHAR(20) DEFAULT NULL,
          statut ENUM('complete','partielle','remboursee') DEFAULT 'complete',
          date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_paiements_commande_id (commande_id)
        ) ENGINE=InnoDB
      `);
      console.log("[schema] Created paiements");
    } else {
      await addColumnIfMissing(conn, "paiements", "num_client", "VARCHAR(20) DEFAULT NULL");
      await addColumnIfMissing(conn, "paiements", "campay_reference", "VARCHAR(100) DEFAULT NULL");
      await addColumnIfMissing(conn, "paiements", "campay_status", "VARCHAR(30) DEFAULT NULL");
      await addColumnIfMissing(conn, "paiements", "campay_operator", "VARCHAR(20) DEFAULT NULL");
    }

    if (!(await tableExists(conn, "campay_solde"))) {
      await conn.query(`
        CREATE TABLE campay_solde (
          id INT AUTO_INCREMENT PRIMARY KEY,
          total_balance DECIMAL(12,2) DEFAULT 0,
          orange_balance DECIMAL(12,2) DEFAULT 0,
          mtn_balance DECIMAL(12,2) DEFAULT 0,
          currency VARCHAR(10) DEFAULT 'XAF',
          derniere_sync TIMESTAMP NULL,
          UNIQUE KEY uk_solde (id)
        ) ENGINE=InnoDB
      `);
      await conn.query("INSERT IGNORE INTO campay_solde (id) VALUES (1)");
      console.log("[schema] Created campay_solde");
    }
  } finally {
    conn.release();
  }
}

module.exports = { ensureRuntimeSchema };
