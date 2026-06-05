const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
  const dbName = process.env.DB_NAME || 'barrestaurant_db';

  console.log(`🔄 Connexion à MySQL (${dbHost}:${dbPort}) en tant que ${dbUser}...`);
  const conn = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    multipleStatements: true
  });
  
  console.log(`🔄 Restauration de la base de données ${dbName}...`);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await conn.query(`USE \`${dbName}\``);
  
  const sqlPath = path.join(__dirname, '../barrestaurant_db.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Fichier SQL introuvable à : ${sqlPath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('⏳ Exécution des requêtes SQL (re-création et seeding)...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
  await conn.query(sql);
  await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log(`✅ Base de données ${dbName} restaurée avec succès !`);
  await conn.end();
  process.exit(0);
})().catch(err => {
  console.error('❌ Erreur lors de la restauration :', err.message);
  process.exit(1);
});
