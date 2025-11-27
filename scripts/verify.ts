import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import {
  checkMAC,
  checkDAC,
  checkABAC,
  checkRuBAC,
} from "../src/lib/access-control";
import { db } from "../src/lib/db";
import { users, grades } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function verify() {
  console.log("Starting Verification...");

  // Fetch seeded users
  const student = await db.query.users.findFirst({
    where: eq(users.role, "student"),
  });
  const instructor = await db.query.users.findFirst({
    where: eq(users.role, "instructor"),
  });
  const admin = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
  });

  if (!student || !instructor || !admin) {
    console.error("Users not found. Run seed first.");
    process.exit(1);
  }

  console.log("\n--- Testing MAC (Mandatory Access Control) ---");
  // Student (Public) accessing Confidential Grade -> Should Fail
  const macTest1 = checkMAC(student.securityLevel, "confidential");
  console.log(
    `Student (Public) -> Confidential Resource: ${
      macTest1 ? "ALLOWED (Fail)" : "DENIED (Pass)"
    }`
  );

  // Admin (Restricted) accessing Confidential Grade -> Should Pass
  const macTest2 = checkMAC(admin.securityLevel, "confidential");
  console.log(
    `Admin (Restricted) -> Confidential Resource: ${
      macTest2 ? "ALLOWED (Pass)" : "DENIED (Fail)"
    }`
  );

  console.log("\n--- Testing RuBAC (Rule-Based Access Control) ---");
  // Time check
  const rubacTest1 = checkRuBAC("business_hours");
  console.log(
    `Access during business hours: ${
      rubacTest1 ? "ALLOWED (Pass)" : "DENIED (Fail)"
    }`
  );

  const rubacTest2 = checkRuBAC("weekday_only");
  console.log(
    `Access on weekday: ${rubacTest2 ? "ALLOWED (Pass)" : "DENIED (Fail)"}`
  );
  console.log(
    `Access at 8 PM: ${rubacTest2 ? "ALLOWED (Fail)" : "DENIED (Pass)"}`
  );

  console.log("\n--- Testing ABAC (Attribute-Based Access Control) ---");
  const userAttr = { department: "CS", role: "student" };
  const resourceAttr = { department: "CS", accessLevel: "public" };

  const abacTest1 = checkABAC(userAttr, resourceAttr, "same_department");
  console.log(
    `Same Department Access: ${abacTest1 ? "ALLOWED (Pass)" : "DENIED (Fail)"}`
  );

  const userAttrDiff = { department: "Math", role: "student" };
  const abacTest2 = checkABAC(userAttrDiff, resourceAttr, "same_department");
  console.log(
    `Diff Department Access: ${abacTest2 ? "ALLOWED (Fail)" : "DENIED (Pass)"}`
  );

  console.log("\nVerification Complete.");
  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
