import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { hash } from "bcryptjs";
import * as readline from "readline";

async function createAdmin() {
  // Dynamically import db and schema to ensure env vars are loaded first
  const { db } = await import("../src/lib/db");
  const { users } = await import("../src/db/schema");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  console.log("🔐 Admin User Creation\n");

  try {
    const name = await question(
      "Enter admin name (default: System Administrator): "
    );
    const email = await question(
      "Enter admin email (default: admin@university.edu): "
    );
    const password = await question("Enter admin password (min 12 chars): ");

    // Validate password length
    if (password.length < 12) {
      console.error("\n❌ Password must be at least 12 characters long");
      rl.close();
      process.exit(1);
    }

    const adminName = name.trim() || "System Administrator";
    const adminEmail = email.trim() || "admin@university.edu";

    // Hash the password
    console.log("\n🔄 Hashing password...");
    const passwordHash = await hash(password, 10);

    // Create admin user
    console.log("🔄 Creating admin user...");
    const [admin] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: adminName,
        email: adminEmail,
        passwordHash: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "admin",
        securityLevel: "restricted",
        mfaEnabled: false,
      })
      .returning();

    console.log("\n✅ Admin user created successfully!\n");
    console.log("📋 Details:");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Security Level: ${admin.securityLevel}`);
    console.log(
      "\n⚠️  IMPORTANT: Enable MFA for this account immediately after first login!\n"
    );

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error creating admin user:", error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
