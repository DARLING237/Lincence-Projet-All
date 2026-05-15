const pool = require('../config/db');

async function migrate() {
  console.log('-- Migration: paiements, mode_paiement, campay_solde --\n');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS paiements (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        commande_id        INT           NOT NULL,
        mode_paiement      ENUM('especes','orange_money','mtn_momo','carte','transfert') NOT NULL,
        montant            BIGINT        NOT NULL,
        reference          VARCHAR(100)  DEFAULT NULL,
        num_client         VARCHAR(20)   DEFAULT NULL,
        campay_reference   VARCHAR(100)  DEFAULT NULL,
        campay_status      VARCHAR(30)   DEFAULT NULL,
        campay_operator    VARCHAR(20)   DEFAULT NULL,
        date_paiement      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_pai_cmd FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('[OK] Table paiements');

    try {
      await pool.query(`
        ALTER TABLE commandes
        ADD COLUMN mode_paiement ENUM('especes','orange_money','mtn_momo','carte','transfert') DEFAULT NULL
      `);
      console.log('[OK] Colonne mode_paiement sur commandes');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('[SKIP] mode_paiement existe deja sur commandes');
      } else {
        throw e;
      }
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS campay_solde (
          id                INT AUTO_INCREMENT PRIMARY KEY,
          total_balance     DECIMAL(12,2) DEFAULT 0,
          orange_balance    DECIMAL(12,2) DEFAULT 0,
          mtn_balance       DECIMAL(12,2) DEFAULT 0,
          derniere_sync     TIMESTAMP     NULL,
          UNIQUE KEY uk_solde (id)
        ) ENGINE=InnoDB
      `);
      console.log('[OK] Table campay_solde');
    } catch (e) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('[SKIP] campay_solde existe deja');
      } else {
        throw e;
      }
    }
  } catch (e) {
    console.error('ERREUR:', e.message);
    process.exit(1);
  }

  console.log('\n-- Migration terminee');
  process.exit(0);
}

migrate();
