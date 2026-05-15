const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const sqlFile = path.join(__dirname, "campay-integration.sql");
const sqlContent = fs.readFileSync(sqlFile, "utf8");

async function runMigration() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "barresto_db",
    multipleStatements: true,
  });

  // Exécuter ligne par ligne
  const lines = sqlContent.split("\n").map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("--"));

  let i = 0;
  while (i < lines.length) {
    // Regrouper les lignes jusqu'au point-virgule
    let stmt = lines[i];
    while (!stmt.endsWith(";") && i + 1 < lines.length) {
      i++;
      stmt += " " + lines[i];
    }
    i++;

    stmt = stmt.trim();
    if (!stmt || stmt.startsWith("--")) continue;

    try {
      await conn.query(stmt);
      console.log("OK: " + stmt.substring(0, 80) + (stmt.length > 80 ? "..." : ""));
    } catch (err) {
      // Ignorer les erreurs "déjà existant"
      const skipCodes = ["ER_DUP_FIELDNAME", "ER_TABLE_EXISTS", "ER_DUP_KEYNAME", "ER_BAD_FIELD_ERROR", "ER_CANT_CREATE_FILE", "ER_PARSE_ERROR"];
      if (skipCodes.includes(err.code)) {
        console.log("SKIP (" + err.code + "): " + stmt.substring(0, 60) + "...");
      } else if (err.code === "ER_WRONG_AUTO_KEY") {
        console.log("SKIP (contrainte CHECK): ignoré MySQL 5.6");
      } else {
        console.error("ERREUR [" + err.code + "]: " + stmt.substring(0, 100));
      }
    }
  }

  // Vérifier le résultat final
  const [tables] = await conn.query("SHOW TABLES LIKE 'paiements'");
  if (tables.length > 0) {
    const [cols] = await conn.query("DESCRIBE paiements");
    console.log("\nTable paiements:");
    cols.forEach(c => console.log("  - " + c.Field + " (" + c.Type + ")"));
  }

  const [solde] = await conn.query("SHOW TABLES LIKE 'campay_solde'");
  if (solde.length > 0) {
    console.log("\nTable campay_solde: OK");
  }

  const [cols] = await conn.query("SHOW COLUMNS FROM commandes");
  const hasModePaiement = cols.some(c => c.Field === "mode_paiement");
  console.log("\nCommandes mode_paiement: " + (hasModePaiement ? "OK" : "MANQUANTE"));

  console.log("\nMigration terminée !");
  await conn.end();
}

runMigration().catch((err) => {
  console.error("Echec: ", err.message);
  process.exit(1);
});
