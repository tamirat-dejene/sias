import { exec } from "child_process";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const BACKUP_DIR = path.join(process.cwd(), "backups");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `backup-${timestamp}.sql`;
const filepath = path.join(BACKUP_DIR, filename);

console.log(`Creating backup at ${filepath}...`);

// Parse connection string to get params for pg_dump if needed,
// or just pass the URL if pg_dump supports it (it usually does via -d)
// Note: pg_dump must be installed on the system.

const command = `pg_dump "${DATABASE_URL}" -f "${filepath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`pg_dump stderr: ${stderr}`);
  }
  console.log(`Backup created successfully: ${filename}`);
});
