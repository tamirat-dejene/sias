import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { dacShares } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shareId } = await request.json();

    if (!shareId) {
      return NextResponse.json({ error: "Share ID required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const [share] = await db
      .select()
      .from(dacShares)
      .where(
        and(eq(dacShares.id, shareId), eq(dacShares.ownerId, session.user.id))
      )
      .limit(1);

    if (!share) {
      return NextResponse.json(
        { error: "Share not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.delete(dacShares).where(eq(dacShares.id, shareId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DAC revoke error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
