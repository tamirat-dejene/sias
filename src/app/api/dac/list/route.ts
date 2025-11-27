import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { dacShares, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get items shared BY user
    const sharedByMe = await db
      .select({
        id: dacShares.id,
        resourceType: dacShares.resourceType,
        resourceId: dacShares.resourceId,
        permission: dacShares.permission,
        sharedWithEmail: users.email,
        sharedWithName: users.name,
        createdAt: dacShares.createdAt,
      })
      .from(dacShares)
      .leftJoin(users, eq(dacShares.sharedWithId, users.id))
      .where(eq(dacShares.ownerId, session.user.id));

    // Get items shared WITH user
    const sharedWithMe = await db
      .select({
        id: dacShares.id,
        resourceType: dacShares.resourceType,
        resourceId: dacShares.resourceId,
        permission: dacShares.permission,
        ownerEmail: users.email,
        ownerName: users.name,
        createdAt: dacShares.createdAt,
      })
      .from(dacShares)
      .leftJoin(users, eq(dacShares.ownerId, users.id))
      .where(eq(dacShares.sharedWithId, session.user.id));

    return NextResponse.json({ sharedByMe, sharedWithMe });
  } catch (error) {
    console.error("DAC list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
