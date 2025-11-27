import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  enrollments,
  students,
  users,
  courses,
  instructors,
  grades,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get instructor's courses and enrollments
    const enrollmentData = await db
      .select({
        enrollmentId: enrollments.id,
        studentName: users.name,
        studentEmail: users.email,
        courseCode: courses.code,
        courseTitle: courses.title,
        semester: enrollments.semester,
        currentGrade: grades.grade,
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(instructors, eq(courses.instructorId, instructors.id))
      .leftJoin(grades, eq(enrollments.id, grades.enrollmentId))
      .where(eq(instructors.userId, session.user.id));

    return NextResponse.json({ enrollments: enrollmentData });
  } catch (error) {
    console.error("Enrollments fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
