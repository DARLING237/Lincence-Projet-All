const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🔄 Restauration de la base de données barrestaurant_db...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    multipleStatements: true
  });
  
  const sqlPath = path.join(__dirname, '../barrestaurant_db.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Fichier SQL introuvable à : ${sqlPath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('⏳ Exécution des requêtes SQL (re-création et seeding)...');
  await conn.query(sql);
  console.log('✅ Base de données restaurée avec succès avec le schéma de restaurant classe !');
  await conn.end();
  process.exit(0);
})().catch(err => {
  console.error('❌ Erreur lors de la restauration :', err.message);
  process.exit(1);
});
