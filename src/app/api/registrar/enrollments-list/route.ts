import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, students, users, courses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const enrollmentList = await db
      .select({
        id: enrollments.id,
        studentName: users.name,
        courseCode: courses.code,
        courseTitle: courses.title,
        semester: enrollments.semester,
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id));

    return NextResponse.json({ enrollments: enrollmentList });
  } catch (error) {
    console.error("Enrollments fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
