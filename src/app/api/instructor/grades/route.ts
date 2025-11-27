import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { grades, enrollments, courses, instructors } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logAction } from "@/lib/audit-logger";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { enrollmentId, grade } = await request.json();

    if (!enrollmentId || !grade) {
      return NextResponse.json(
        { error: "Enrollment ID and grade required" },
        { status: 400 }
      );
    }

    // Verify instructor owns this course
    const [enrollment] = await db
      .select({
        enrollmentId: enrollments.id,
        courseId: courses.id,
        instructorUserId: instructors.userId,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(instructors, eq(courses.instructorId, instructors.id))
      .where(eq(enrollments.id, enrollmentId))
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    if (enrollment.instructorUserId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only grade your own courses" },
        { status: 403 }
      );
    }

    // Update or insert grade
    const [existingGrade] = await db
      .select()
      .from(grades)
      .where(eq(grades.enrollmentId, enrollmentId))
      .limit(1);

    if (existingGrade) {
      await db
        .update(grades)
        .set({
          grade,
          updatedBy: session.user.id,
        })
        .where(eq(grades.id, existingGrade.id));
    } else {
      await db.insert(grades).values({
        enrollmentId,
        grade,
        updatedBy: session.user.id,
        securityLevel: "confidential",
      });
    }

    // Log grade change
    await logAction(session.user.id, "GRADE_UPDATE", "grades", {
      enrollmentId,
      newGrade: grade,
      oldGrade: existingGrade?.grade || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Grade update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
