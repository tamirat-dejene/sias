import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
  const client = await pool.connect();
  try {
    console.log("Starting migration 0002...");

    // Create password_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "password_history" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "password_hash" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create password_reset table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "password_reset" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "token" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL,
        CONSTRAINT "password_reset_token_unique" UNIQUE("token")
      );
    `);

    // Add columns to user table
    const userColumns = [
      'ADD COLUMN IF NOT EXISTS "mfa_enabled" boolean DEFAULT false NOT NULL',
      'ADD COLUMN IF NOT EXISTS "mfa_secret" text',
      'ADD COLUMN IF NOT EXISTS "backup_codes" text[]',
      'ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL',
      'ADD COLUMN IF NOT EXISTS "verification_token" text',
      'ADD COLUMN IF NOT EXISTS "verification_token_expires" timestamp',
      'ADD COLUMN IF NOT EXISTS "failed_login_attempts" integer DEFAULT 0 NOT NULL',
      'ADD COLUMN IF NOT EXISTS "locked_until" timestamp',
      'ADD COLUMN IF NOT EXISTS "last_login_attempt" timestamp',
    ];

    for (const column of userColumns) {
      await client.query(`ALTER TABLE "user" ${column};`);
    }

    // Add foreign keys safely
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "password_history" 
        ADD CONSTRAINT "password_history_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") 
        ON DELETE no action ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "password_reset" 
        ADD CONSTRAINT "password_reset_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") 
        ON DELETE no action ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("✅ Migration 0002 completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();
