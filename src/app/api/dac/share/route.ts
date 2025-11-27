import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { dacShares, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAction } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resourceType, resourceId, sharedWithEmail, permission } =
      await request.json();

    if (!resourceType || !resourceId || !sharedWithEmail || !permission) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user to share with
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, sharedWithEmail))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot share with yourself" },
        { status: 400 }
      );
    }

    // Create share
    await db.insert(dacShares).values({
      resourceType,
      resourceId,
      ownerId: session.user.id,
      sharedWithId: targetUser.id,
      permission,
    });

    await logAction(session.user.id, "DAC_SHARE", resourceType, {
      resourceId,
      sharedWith: targetUser.email,
      permission,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DAC share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
