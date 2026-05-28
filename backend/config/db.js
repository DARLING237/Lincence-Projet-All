/**
 * BarResto - Database Connection
 * Connexion MySQL via mysql2/promise
 */
require("dotenv").config({ path: __dirname + "/../.env" });

const mysql = require("mysql2/promise");

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT = 3306,
} = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
  console.error("❌ Variables DB manquantes (DB_HOST, DB_USER, DB_NAME)");
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: parseInt(DB_PORT, 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
  dateStrings: true,
  // ✅ Ajouts pour Railway
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 30000,
  ssl: { rejectUnauthorized: false },
});

// Test de connexion (ne pas terminer l'application en production serverless)
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Connexion MySQL réussie");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Erreur connexion MySQL:", err.message);
    console.warn("Le pool MySQL est initialisé, mais la connexion de test a échoué. Les requêtes ultérieures renverront une erreur si le backend ne peut pas atteindre la base de données.");
  });

module.exports = pool;