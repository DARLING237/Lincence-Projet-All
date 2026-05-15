// Script de sauvegarde de la base de donnÃ©es
// Usage: node scripts/backup-db.js [--restore path/to/backup.sql]
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
require("dotenv").config({ path: "../.env" });

const BACKUP_DIR = path.join(__dirname, "../backups");
const DATE = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
const BACKUP_FILE = `bar_backup_${DATE}.sql`;
const BACKUP_PATH = path.join(BACKUP_DIR, BACKUP_FILE);
const MAX_BACKUPS = 14;

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
  console.error("❌ Variables DB manquantes (.env requis)");
  process.exit(1);
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Dossier backups créé: ${BACKUP_DIR}`);
  }
}

function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length > MAX_BACKUPS) {
    const toDelete = files.slice(0, files.length - MAX_BACKUPS);
    toDelete.forEach((f) => {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
      console.log(`🗑️  Supprimé: ${f}`);
    });
  }
}

function mysqldump() {
  ensureBackupDir();

  const cmd = `mysqldump -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}"`;

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(BACKUP_PATH);
    const child = exec(cmd);

    child.stdout.pipe(output);
    child.stderr.on("data", (data) => process.stderr.write(data));

    child.on("exit", (code) => {
      if (code === 0) {
        const size = fs.statSync(BACKUP_PATH).size;
        console.log(`✅ Backup créé: ${BACKUP_FILE} (${(size / 1024).toFixed(1)} Ko)`);
        cleanupOldBackups();
        resolve();
      } else {
        reject(new Error(`mysqldump a échoué avec le code ${code}`));
      }
    });
  });
}

function restore(backupPath) {
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Fichier introuvable: ${backupPath}`);
    process.exit(1);
  }

  const cmd = `mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}"`;

  return new Promise((resolve, reject) => {
    const child = exec(cmd);
    const input = fs.createReadStream(backupPath);
    input.pipe(child.stdin);

    child.on("exit", (code) => {
      if (code === 0) {
        console.log(`✅ Base restaurée depuis ${path.basename(backupPath)}`);
        resolve();
      } else {
        reject(new Error(`Restauration échouée avec le code ${code}`));
      }
    });
  });
}

// ── Main ──

const args = process.argv.slice(2);

if (args[0] === "--restore" && args[1]) {
  console.log(`🔄 Restauration depuis ${args[1]}...`);
  restore(args[1]).catch(console.error);
} else {
  console.log("🗄️  Sauvegarde de la base de données...");
  mysqldump().catch(console.error);
}
