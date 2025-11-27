import { hash, compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "./db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import zxcvbn from "zxcvbn";

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await compare(password, passwordHash);
}

// Session utilities
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateUserId(): string {
  return randomBytes(16).toString("hex");
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const sessionId = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    token,
    userId,
    expiresAt,
    createdAt: new Date(),
  });

  return { token, expiresAt };
}

export async function validateSession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }

  // Get user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    session,
    user,
  };
}

export async function invalidateSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function invalidateUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ============================================
// PASSWORD VALIDATION & POLICIES
// ============================================

/**
 * Common weak passwords to reject
 */
const COMMON_PASSWORDS = [
  "password",
  "password123",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "1234567",
  "letmein",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "bailey",
  "passw0rd",
  "shadow",
  "123123",
  "654321",
  "superman",
  "qazwsx",
  "michael",
  "football",
];

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "fair" | "good" | "strong" | "very-strong";
  score: number; // 0-4
  suggestions: string[];
}

/**
 * Validate password against security policies
 * Requirements:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * - Not in common passwords list
 */
export function validatePassword(
  password: string,
  userInputs: string[] = []
): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&* etc.)"
    );
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push(
      "This password is too common. Please choose a more unique password"
    );
  }

  // Use zxcvbn for strength analysis
  const result = zxcvbn(password, userInputs);

  // Map zxcvbn score (0-4) to strength labels
  const strengthLabels: Array<
    "weak" | "fair" | "good" | "strong" | "very-strong"
  > = ["weak", "fair", "good", "strong", "very-strong"];

  return {
    isValid: errors.length === 0,
    errors,
    strength: strengthLabels[result.score],
    score: result.score,
    suggestions: result.feedback.suggestions || [],
  };
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): number {
  return zxcvbn(password).score;
}

/**
 * Check if password has been used before (to prevent reuse)
 */
export async function isPasswordReused(
  userId: string,
  newPasswordHash: string
): Promise<boolean> {
  // This would check against password_history table
  // For now, return false (will implement with password_history table)
  return false;
}
