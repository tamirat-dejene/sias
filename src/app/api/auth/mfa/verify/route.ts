import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyMFAToken, generateBackupCodes } from "@/lib/mfa-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Get user to get secret
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || !user.mfaSecret) {
      return NextResponse.json(
        { error: "MFA setup not initiated" },
        { status: 400 }
      );
    }

    const isValid = verifyMFAToken(token, user.mfaSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const backupCodes = generateBackupCodes();

    await db
      .update(users)
      .set({
        mfaEnabled: true,
        backupCodes: backupCodes,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, backupCodes });
  } catch (error) {
    console.error("MFA verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
