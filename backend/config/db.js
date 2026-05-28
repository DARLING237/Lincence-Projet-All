require("dotenv").config();
const mysql = require("mysql2/promise"); // Déclaré UNE SEULE FOIS ici au sommet

// --- Configuration du Pool de connexion ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3307, // Utilise le port 3307 de Filess.io par défaut
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Option SSL essentielle pour la production sur Vercel
  ssl: {
    rejectUnauthorized: false
  }
});

// Exportation unique du pool
module.exports = pool;