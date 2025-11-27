import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, students, users, courses, grades } from "@/db/schema";
import { eq } from "drizzle-orm";

const gradePoints: Record<string, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get student record
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.userId, session.user.id))
      .limit(1);

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // Get enrollments with grades
    const enrollmentData = await db
      .select({
        courseCode: courses.code,
        courseTitle: courses.title,
        semester: enrollments.semester,
        grade: grades.grade,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(grades, eq(enrollments.id, grades.enrollmentId))
      .where(eq(enrollments.studentId, student.id));

    // Calculate GPA
    let totalPoints = 0;
    let totalCourses = 0;

    enrollmentData.forEach((e) => {
      if (e.grade && gradePoints[e.grade] !== undefined) {
        totalPoints += gradePoints[e.grade];
        totalCourses++;
      }
    });

    const gpa = totalCourses > 0 ? totalPoints / totalCourses : 0;

    return NextResponse.json({
      studentName: session.user.name,
      studentEmail: session.user.email,
      enrollments: enrollmentData,
      gpa,
    });
  } catch (error) {
    console.error("Transcript fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
