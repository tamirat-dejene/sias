import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (
      user.verificationTokenExpires &&
      new Date(user.verificationTokenExpires) < new Date()
    ) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
