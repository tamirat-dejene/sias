import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logAction } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { studentId, courseId, semester } = await request.json();

    if (!studentId || !courseId || !semester) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const [existing] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.courseId, courseId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Student already enrolled" },
        { status: 400 }
      );
    }

    // Create enrollment
    await db.insert(enrollments).values({
      studentId,
      courseId,
      semester,
    });

    await logAction(session.user.id, "ENROLL_STUDENT", "enrollments", {
      studentId,
      courseId,
      semester,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { enrollmentId } = await request.json();

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment ID required" },
        { status: 400 }
      );
    }

    await db.delete(enrollments).where(eq(enrollments.id, enrollmentId));

    await logAction(session.user.id, "DROP_STUDENT", "enrollments", {
      enrollmentId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Drop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
