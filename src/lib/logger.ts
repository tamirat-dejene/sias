import { db } from "./db";
import { auditLogs } from "@/db/schema";

export async function logAction(
  userId: string,
  action: string,
  resource: string,
  details?: any,
  ipAddress?: string
) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      resource,
      details,
      ipAddress,
      timestamp: new Date(),
    });
    console.log(`[AUDIT] ${action} by ${userId} on ${resource}`);
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
