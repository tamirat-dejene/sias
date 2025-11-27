import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
  const client = await pool.connect();

  try {
    console.log("Starting migration...");

    // Drop tables that are no longer needed
    console.log("Dropping account table...");
    await client.query("DROP TABLE IF EXISTS account CASCADE");

    console.log("Dropping verification table...");
    await client.query("DROP TABLE IF EXISTS verification CASCADE");

    // Add password_hash column to user table
    console.log("Adding password_hash column to user table...");
    await client.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS password_hash text
    `);

    // Make password_hash NOT NULL (set a default first for existing rows)
    console.log("Setting default password hash for existing users...");
    await client.query(`
      UPDATE "user" 
      SET password_hash = '$2a$10$defaulthashforexistingusers' 
      WHERE password_hash IS NULL
    `);

    await client.query(`
      ALTER TABLE "user" 
      ALTER COLUMN password_hash SET NOT NULL
    `);

    // Drop columns from session table
    console.log("Removing columns from session table...");
    await client.query("ALTER TABLE session DROP COLUMN IF EXISTS updated_at");
    await client.query("ALTER TABLE session DROP COLUMN IF EXISTS ip_address");
    await client.query("ALTER TABLE session DROP COLUMN IF EXISTS user_agent");

    // Drop columns from user table
    console.log("Removing columns from user table...");
    await client.query(
      'ALTER TABLE "user" DROP COLUMN IF EXISTS email_verified'
    );
    await client.query('ALTER TABLE "user" DROP COLUMN IF EXISTS image');

    console.log("✅ Migration completed successfully!");
    console.log(
      "\n⚠️  IMPORTANT: Existing users have a default password hash."
    );
    console.log(
      "   They will need to reset their passwords or you need to update the seed script."
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
