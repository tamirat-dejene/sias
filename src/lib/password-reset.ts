import { db } from "@/lib/db";
import { passwordResets, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function createPasswordResetToken(email: string) {
  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return null; // Don't reveal if user exists
  }

  // Generate token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete existing tokens for user
  await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));

  // Create new token
  await db.insert(passwordResets).values({
    id: randomBytes(16).toString("hex"),
    userId: user.id,
    token,
    expiresAt,
    createdAt: new Date(),
  });

  return token;
}

export async function validatePasswordResetToken(token: string) {
  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.token, token))
    .limit(1);

  if (!reset) {
    return null;
  }

  if (reset.expiresAt < new Date()) {
    await db.delete(passwordResets).where(eq(passwordResets.id, reset.id));
    return null;
  }

  return reset;
}

export async function deletePasswordResetToken(id: string) {
  await db.delete(passwordResets).where(eq(passwordResets.id, id));
}
