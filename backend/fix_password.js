const mysql = require('mysql2/promise');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
  const dbName = process.env.DB_NAME || 'barrestaurant_db';

  console.log(`🔄 Connexion à la base de données ${dbName} (${dbHost}:${dbPort}) pour fixer le mot de passe...`);
  const conn = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    database: dbName
  });
  const hash = '$2a$10$drdUXBfKtQMifphVdpX32e8ec0dg1X4C0c1AyyJxXuxHJcYX.NUhy';
  await conn.execute('UPDATE utilisateurs SET mot_de_passe=? WHERE id=1', [hash]);
  const [rows] = await conn.execute('SELECT id, email, mot_de_passe FROM utilisateurs WHERE id=1');
  console.log('Stored hash:', rows[0].mot_de_passe);
  console.log('Length:', rows[0].mot_de_passe.length);
  await conn.end();
})().catch(e => console.error(e));