import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAction } from "@/lib/audit-logger";
import { hashPassword } from "@/lib/auth-utils";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "registrar")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const studentList = await db
      .select({
        id: students.id,
        userId: students.userId,
        name: users.name,
        email: users.email,
        year: students.year,
        major: students.major,
        gpa: students.gpa,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id));

    return NextResponse.json({ students: studentList });
  } catch (error) {
    console.error("Students fetch error:", error);
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

    const { name, email, password, year, major } = await request.json();

    if (!name || !email || !password || !year || !major) {
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
        role: "student",
        department: major,
        securityLevel: "public",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();

    // Create student record
    const [newStudent] = await db
      .insert(students)
      .values({
        userId: newUser.id,
        year: parseInt(year),
        major,
        gpa: 0.0,
        enrollmentStatus: "active",
      })
      .returning();

    await logAction(session.user.id, "CREATE_STUDENT", "students", {
      studentId: newStudent.id,
      userId: newUser.id,
      email,
    });

    return NextResponse.json({ student: newStudent });
  } catch (error) {
    console.error("Student creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, year, major, gpa } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Student ID required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(students)
      .set({
        year: year ? parseInt(year) : undefined,
        major,
        gpa: gpa !== undefined ? parseFloat(gpa) : undefined,
      })
      .where(eq(students.id, id))
      .returning();

    await logAction(session.user.id, "UPDATE_STUDENT", "students", {
      studentId: id,
      changes: { year, major, gpa },
    });

    return NextResponse.json({ student: updated });
  } catch (error) {
    console.error("Student update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
