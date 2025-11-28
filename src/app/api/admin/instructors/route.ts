import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { instructors, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAction } from "@/lib/audit-logger";
import { hashPassword } from "@/lib/auth-utils";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const instructorList = await db
      .select({
        id: instructors.id,
        userId: instructors.userId,
        name: users.name,
        email: users.email,
        department: users.department,
      })
      .from(instructors)
      .innerJoin(users, eq(instructors.userId, users.id));

    return NextResponse.json({ instructors: instructorList });
  } catch (error) {
    console.error("Instructors fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, email, password, department } = await request.json();

    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Create user account
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const now = new Date();
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name,
        email,
        passwordHash,
        role: "instructor",
        department,
        securityLevel: "internal",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();

    // Create instructor record
    const [newInstructor] = await db
      .insert(instructors)
      .values({
        userId: newUser.id,
      })
      .returning();

    await logAction(session.user.id, "CREATE_INSTRUCTOR", "instructors", {
      instructorId: newInstructor.id,
      userId: newUser.id,
      email,
    });

    return NextResponse.json({ instructor: newInstructor });
  } catch (error) {
    console.error("Instructor creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
