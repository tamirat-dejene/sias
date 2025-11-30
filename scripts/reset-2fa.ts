import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function reset2FA(username: string) {
  console.log(`Resetting 2FA for user: ${username}`);

  // Dynamic import to ensure env vars are loaded first
  const { db } = await import("../src/lib/db");
  const { users } = await import("../src/db/schema");

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.name, username),
    });

    if (!user) {
      console.error(`User '${username}' not found.`);
      const allUsers = await db.query.users.findMany();
      console.log("Available users:", allUsers.map((u) => u.name).join(", "));
      process.exit(1);
    }

    await db
      .update(users)
      .set({
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: null,
      })
      .where(eq(users.id, user.id));

    console.log(`Successfully reset 2FA for user: ${username}`);
  } catch (error) {
    console.error("Error resetting 2FA:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

const username = process.argv[2] || "alice";
reset2FA(username);
