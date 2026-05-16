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
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 5,
  ssl: { rejectUnauthorized: false },
});

// Test de connexion
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Connexion MySQL réussie");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Erreur connexion MySQL:", err.message);
    process.exit(1);
  });

module.exports = pool;