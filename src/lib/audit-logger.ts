import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";
import { headers } from "next/headers";
import { encryptLogData } from "./encryption";

export async function logAction(
  userId: string | null,
  action: string,
  resource: string | null,
  details: Record<string, any> = {}
) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Encrypt sensitive details
    const encryptedDetails = encryptLogData(details);

    await db.insert(auditLogs).values({
      userId,
      action,
      resource,
      ipAddress,
      details: encryptedDetails as any, // Store encrypted string
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Audit log failed:", error);
    // Fail silently to not block the main action, but log to console
  }
}
