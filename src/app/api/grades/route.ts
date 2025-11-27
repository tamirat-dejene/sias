import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { grades, enrollments, courses, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkMAC, SecurityLevel } from "@/lib/access-control";
import { logAction } from "@/lib/audit-logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all grades (in a real app, you'd filter by user/role first)
    // Here we fetch all to demonstrate MAC filtering
    const allGrades = await db
      .select({
        id: grades.id,
        grade: grades.grade,
        courseCode: courses.code,
        courseTitle: courses.title,
        securityLevel: grades.securityLevel,
      })
      .from(grades)
      .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id));

    // Apply MAC filtering
    const userSecurityLevel = session.user.securityLevel as SecurityLevel;

    const accessibleGrades = allGrades.filter((grade) =>
      checkMAC(userSecurityLevel, grade.securityLevel as SecurityLevel)
    );

    await logAction(session.user.id, "ACCESS_GRADES", "grades", {
      userSecurityLevel,
      totalFound: allGrades.length,
      accessibleCount: accessibleGrades.length,
    });

    return NextResponse.json({
      grades: accessibleGrades,
      userSecurityLevel,
      totalFound: allGrades.length,
      accessibleCount: accessibleGrades.length,
    });
  } catch (error) {
    console.error("Grades fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
