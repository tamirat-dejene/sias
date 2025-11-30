import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  createSession,
  generateUserId,
  validatePassword,
  generateSessionToken,
} from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email-service";
import { logAction } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, captchaToken } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (!captchaToken) {
      return NextResponse.json({ error: "CAPTCHA required" }, { status: 400 });
    }

    // Verify CAPTCHA
    const captchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${
        process.env.RECAPTCHA_SECRET_KEY ||
        "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
      }&response=${captchaToken}`,
      {
        method: "POST",
      }
    );
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, [email, name]);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      // Log failed signup attempt (duplicate email)
      await logAction(null, "signup_failed", "user", {
        email,
        reason: "duplicate_email",
      });
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = generateUserId();
    const verificationToken = generateSessionToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "student", // Default role
        securityLevel: "public",
        emailVerified: false,
        verificationToken,
        verificationTokenExpires: verificationExpires,
      })
      .returning();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Log successful signup
    await logAction(userId, "signup_success", "user", {
      email,
      name,
      role: newUser.role,
    });

    // Create session
    const { token, expiresAt } = await createSession(userId);

    // Set cookie
    const response = NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Sign up error:", error);
    // Log signup error
    await logAction(null, "signup_error", "user", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
