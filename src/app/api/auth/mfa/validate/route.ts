import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyMFAToken } from "@/lib/mfa-utils";
import { verifyToken } from "@/lib/token-utils";
import { createSession } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const pendingToken = request.cookies.get("mfa_pending_token")?.value;

    if (!token || !pendingToken) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const userId = verifyToken(pendingToken);
    if (!userId) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.mfaSecret) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    // Verify OTP
    const isValid = verifyMFAToken(token, user.mfaSecret);

    // Also check backup codes
    let usedBackupCode = false;
    if (!isValid && user.backupCodes) {
      if (user.backupCodes.includes(token)) {
        usedBackupCode = true;
        // Remove used backup code
        const newBackupCodes = user.backupCodes.filter((c) => c !== token);
        await db
          .update(users)
          .set({ backupCodes: newBackupCodes })
          .where(eq(users.id, userId));
      } else {
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      }
    } else if (!isValid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Create session
    const { token: sessionToken, expiresAt } = await createSession(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set session cookie
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    // Clear pending cookie
    response.cookies.delete("mfa_pending_token");

    return response;
  } catch (error) {
    console.error("MFA validate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
