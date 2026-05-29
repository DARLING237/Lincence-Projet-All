/**
 * BarResto - Database Connection
 * Connexion MySQL via mysql2/promise
 */
require("dotenv").config({ path: __dirname + "/../.env" });

// On déclare mysql UNE SEULE FOIS ici
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

// La ligne en double a été supprimée ici !

const pool = mysql.createPool({
  host: DB_HOST, // Utilisation directe des variables destructurées au-dessus
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Option cruciale pour certains hébergeurs cloud comme Filess.io
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;