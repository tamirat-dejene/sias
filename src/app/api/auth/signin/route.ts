import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth-utils";
import { signToken } from "@/lib/token-utils";
import { logAction } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      await logAction(null, "LOGIN_FAILED", "auth", {
        email,
        reason: "User not found",
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      await logAction(user.id, "LOGIN_LOCKED", "auth", { email });
      const waitMinutes = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Account locked. Try again in ${waitMinutes} minutes.` },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      await logAction(user.id, "LOGIN_FAILED", "auth", {
        email,
        reason: "Invalid password",
      });
      // Increment failed attempts
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockedUntil = null;

      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await db
        .update(users)
        .set({
          failedLoginAttempts: attempts,
          lockedUntil: lockedUntil,
          lastLoginAttempt: new Date(),
        })
        .where(eq(users.id, user.id));

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Reset failed attempts on success
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAttempt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Check for MFA
    if (user.mfaEnabled) {
      await logAction(user.id, "LOGIN_MFA_CHALLENGE", "auth", { email });
      const mfaToken = signToken(user.id);
      const response = NextResponse.json({ mfaRequired: true });

      response.cookies.set("mfa_pending_token", mfaToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        path: "/",
      });

      return response;
    }

    // Create session
    const { token, expiresAt } = await createSession(user.id);
    await logAction(user.id, "LOGIN_SUCCESS", "auth", { email });

    // Set cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
