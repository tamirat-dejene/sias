import { db } from "@/lib/db";
import { dacShares, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Types
export type SecurityLevel =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";
export type Role =
  | "student"
  | "instructor"
  | "department_head"
  | "registrar"
  | "admin";
export type Permission = "read" | "write";

// ==========================================
// 1. Mandatory Access Control (MAC)
// ==========================================
const SECURITY_LEVELS: Record<SecurityLevel, number> = {
  public: 1,
  internal: 2,
  confidential: 3,
  restricted: 4,
};

export function checkMAC(
  userLevel: SecurityLevel,
  resourceLevel: SecurityLevel
): boolean {
  return SECURITY_LEVELS[userLevel] >= SECURITY_LEVELS[resourceLevel];
}

// ==========================================
// 2. Discretionary Access Control (DAC)
// ==========================================
export async function checkDAC(
  userId: string,
  resourceId: number,
  resourceType: string,
  permission: Permission = "read"
): Promise<boolean> {
  // Check if owner (implicit DAC) - This would typically be checked before calling this,
  // but we can add logic here if we pass ownerId. For now, we check shared permissions.

  const [share] = await db
    .select()
    .from(dacShares)
    .where(
      and(
        eq(dacShares.sharedWithId, userId),
        eq(dacShares.resourceId, resourceId),
        eq(dacShares.resourceType, resourceType)
      )
    )
    .limit(1);

  if (!share) return false;

  // If asking for 'read', any permission works. If 'write', need 'write'.
  if (permission === "read") return true;
  return share.permission === "write";
}

// ==========================================
// 3. Role-Based Access Control (RBAC)
// ==========================================
const ROLE_HIERARCHY: Record<Role, number> = {
  student: 1,
  instructor: 2,
  department_head: 3,
  registrar: 4,
  admin: 5,
};

export function checkRBAC(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ==========================================
// 4. Rule-Based Access Control (RuBAC)
// ==========================================
export function checkRuBAC(
  ruleType: "business_hours" | "weekday_only"
): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  const hour = now.getHours();

  if (ruleType === "business_hours") {
    // Mon-Fri, 9am-5pm
    if (day === 0 || day === 6) return false;
    if (hour < 9 || hour >= 17) return false;
    return true;
  }

  if (ruleType === "weekday_only") {
    return day !== 0 && day !== 6;
  }

  return false;
}

// ==========================================
// 5. Attribute-Based Access Control (ABAC)
// ==========================================
export function checkABAC(
  userAttributes: Record<string, any>,
  resourceAttributes: Record<string, any>,
  policy: "same_department" | "same_year"
): boolean {
  if (policy === "same_department") {
    return userAttributes.department === resourceAttributes.department;
  }

  if (policy === "same_year") {
    return userAttributes.year === resourceAttributes.year;
  }

  return false;
}
