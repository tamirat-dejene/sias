import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAction } from "@/lib/audit-logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { role } = await request.json();
    const { id: userId } = await params;

    if (
      !role ||
      ![
        "student",
        "instructor",
        "department_head",
        "registrar",
        "admin",
      ].includes(role)
    ) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get current user info
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldRole = targetUser.role;

    // Update role
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Log role change
    await logAction(session.user.id, "ROLE_CHANGE", "users", {
      targetUserId: userId,
      targetUserEmail: targetUser.email,
      oldRole,
      newRole: role,
      changedBy: session.user.email,
    });

    return NextResponse.json({ success: true, oldRole, newRole: role });
  } catch (error) {
    console.error("Role change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
