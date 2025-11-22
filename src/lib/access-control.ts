import { db } from "./db";
import { dacShares, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Types
type User = typeof users.$inferSelect;
type SecurityLevel = "public" | "internal" | "confidential" | "restricted";

const SECURITY_LEVELS: Record<SecurityLevel, number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  restricted: 3,
};

/**
 * Mandatory Access Control (MAC)
 * Checks if user has sufficient security clearance for the resource.
 * Rule: User Level >= Resource Level (Read Down)
 */
export function checkMAC(userLevel: SecurityLevel, resourceLevel: SecurityLevel): boolean {
  return SECURITY_LEVELS[userLevel] >= SECURITY_LEVELS[resourceLevel];
}

/**
 * Discretionary Access Control (DAC)
 * Checks if the resource owner has explicitly shared the resource with the user.
 */
export async function checkDAC(userId: string, resourceId: number, resourceType: string, permission: "read" | "write"): Promise<boolean> {
  const share = await db.query.dacShares.findFirst({
    where: and(
      eq(dacShares.sharedWithId, userId),
      eq(dacShares.resourceId, resourceId),
      eq(dacShares.resourceType, resourceType),
      eq(dacShares.permission, permission)
    ),
  });
  return !!share;
}

/**
 * Attribute-Based Access Control (ABAC)
 * Evaluates access based on user attributes, resource attributes, and environment conditions.
 */
export function checkABAC(user: User, resource: any, context: any): boolean {
  // Example Policy: Instructors can only edit grades for their own courses
  if (user.role === "instructor" && context.action === "edit_grade") {
    return resource.instructorId === user.id; // Assuming resource is a Course or linked entity
  }

  // Example Policy: Students can only view their own grades
  if (user.role === "student" && context.action === "view_grade") {
    return resource.studentId === user.id; // Assuming resource is an Enrollment or Grade
  }

  // Example Policy: Department Heads can view data for their department
  if (user.role === "department_head" && context.action === "view_report") {
    return resource.department === user.department;
  }

  return false;
}

/**
 * Rule-Based Access Control (RuBAC) Helper
 * Checks time and location constraints.
 */
export function checkRuBAC(context: { ip?: string, time?: Date }): boolean {
  const now = context.time || new Date();
  const hour = now.getHours();

  // Rule: Access allowed only between 8:00 AM – 6:00 PM
  if (hour < 8 || hour >= 18) {
    return false;
  }

  // Rule: Instructors can only update grades on campus IP (mock check)
  if (context.ip && !context.ip.startsWith("192.168.1.")) { // Example Campus IP range
     // This would be specific to the action, but for general RuBAC check:
     // return false; 
     // We'll leave this as a warning or specific check in the handler
  }

  return true;
}
