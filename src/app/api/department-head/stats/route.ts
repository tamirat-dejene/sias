import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  students,
  courses,
  instructors,
  users,
  enrollments,
  grades,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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
    if (!session || session.user.role !== "department_head") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const department = (session.user as any).department || "Computer Science";

    // Get total students in department
    const departmentStudents = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(users.department, department));

    // Get total courses in department
    const departmentCourses = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.department, department));

    // Get total instructors in department
    const departmentInstructors = await db
      .select({ count: sql<number>`count(*)` })
      .from(instructors)
      .innerJoin(users, eq(instructors.userId, users.id))
      .where(eq(users.department, department));

    // Get enrollments by year
    const enrollmentsByYear = await db
      .select({
        year: students.year,
        count: sql<number>`count(*)`,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(users.department, department))
      .groupBy(students.year);

    // Calculate average GPA (simplified)
    const allGrades = await db
      .select({ grade: grades.grade })
      .from(grades)
      .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(users.department, department));

    let totalPoints = 0;
    let totalGrades = 0;
    allGrades.forEach((g) => {
      if (g.grade && gradePoints[g.grade] !== undefined) {
        totalPoints += gradePoints[g.grade];
        totalGrades++;
      }
    });

    const averageGPA = totalGrades > 0 ? totalPoints / totalGrades : 0;

    const enrollmentsByYearMap: Record<string, number> = {};
    enrollmentsByYear.forEach((e) => {
      enrollmentsByYearMap[e.year.toString()] = Number(e.count);
    });

    return NextResponse.json({
      totalStudents: Number(departmentStudents[0]?.count || 0),
      totalCourses: Number(departmentCourses[0]?.count || 0),
      totalInstructors: Number(departmentInstructors[0]?.count || 0),
      averageGPA,
      enrollmentsByYear: enrollmentsByYearMap,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
