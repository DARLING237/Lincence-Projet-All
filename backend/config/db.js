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






const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3307, 
  // --- LES LIGNES CRUCIALES POUR TOI ---
  waitForConnections: true,  // Met les requêtes en attente au lieu de planter si le pool est plein
  connectionLimit: 2,        // Ne JAMAIS ouvrir plus de 2 connexions simultanées sur Vercel
  queueLimit: 0              // Pas de limite sur la file d'attente des requêtes en attente
});


module.exports = pool;