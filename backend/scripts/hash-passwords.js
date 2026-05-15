require("dotenv").config({ path: __dirname + "/../.env" });

const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const SALT_ROUNDS = 10;

async function main() {
  console.log("=== Password Hash Migration ===\n");

  // 1. Fetch all users whose mot_de_passe does NOT start with $2
  const [users] = await pool.query(
    "SELECT id, email, nom, mot_de_passe FROM utilisateurs WHERE mot_de_passe NOT LIKE '$2%'"
  );

  if (users.length === 0) {
    console.log("No plaintext passwords found. Migration not needed.");
    await pool.end();
    return;
  }

  console.log(`Found ${users.length} user(s) with plaintext passwords.\n`);

  let hashed = 0;
  let lastHash = null;

  for await (const user of users) {
    const plaintext = user.mot_de_passe;
    const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);

    await pool.query(
      "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?",
      [hash, user.id]
    );

    console.log(`  [${hashed + 1}/${users.length}] Hashed password for user ${user.id} (${user.email} / ${user.nom})`);
    hashed++;
    lastHash = { id: user.id, plaintext, hash };
  }

  console.log(`\n${hashed} user(s) hashed successfully.`);

  // 2. Verify one of the hashes to confirm success
  if (lastHash) {
    const ok = await bcrypt.compare(lastHash.plaintext, lastHash.hash);
    if (ok) {
      console.log(`Verification OK: bcrypt.compare confirmed hash for user ${lastHash.id} (${lastHash.plaintext}).`);
    } else {
      console.error(`Verification FAILED for user ${lastHash.id}. Manual review required.`);
      process.exitCode = 1;
    }
  }

  console.log("\n=== Migration complete ===");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  pool.end();
  process.exit(1);
});
