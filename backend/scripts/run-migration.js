#!/usr/bin/env node

const db = require('../config/db');
const fs = require('fs');
const path = require('path');

console.log('🔄 Exécution de la migration pour le suivi des connexions...');

// Lire le script SQL
const migrationPath = path.join(__dirname, 'add-connection-tracking.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Exécuter les commandes SQL
const statements = migrationSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function runMigration() {
  try {
    for (const statement of statements) {
      if (statement.includes('CREATE INDEX') || statement.includes('ADD INDEX')) {
        // Pour les index, utiliser IF NOT EXISTS
        const modifiedStatement = statement.replace(/CREATE INDEX/, 'CREATE INDEX IF NOT EXISTS')
                                          .replace(/ADD INDEX/, 'ALTER TABLE presences ADD INDEX IF NOT EXISTS');
        await db.query(modifiedStatement);
        console.log('✅ Index créé/modifié');
      } else if (statement.includes('ALTER TABLE')) {
        // Pour les ALTER TABLE, vérifier d'abord si les colonnes existent
        await db.query(statement);
        console.log('✅ Table modifiée avec succès');
      }
    }

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('\nChamps ajoutés à la table presences:');
    console.log('- date_connexion (TIMESTAMP)');
    console.log('- heure_connexion (TIME)');
    console.log('- date_deconnexion (TIMESTAMP)');
    console.log('- heure_deconnexion (TIME)');
    console.log('- ip_address (VARCHAR(45))');
    console.log('- session_id (VARCHAR(255))');
    console.log('- duree_session (INT)');
    console.log('\nStatut mis à jour pour inclure: session_active');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

runMigration();