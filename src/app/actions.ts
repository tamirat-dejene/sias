"use server";

import { db } from "@/lib/db";
import {
  students,
  enrollments,
  courses,
  grades,
  instructors,
  dacShares,
  users,
  auditLogs,
} from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// Helper to get current user
async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function getStudentGrades() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return null;

  // Find student record
  const student = await db.query.students.findFirst({
    where: eq(students.userId, user.id),
  });

  if (!student) return [];

  const data = await db
    .select({
      courseCode: courses.code,
      courseTitle: courses.title,
      grade: grades.grade,
      semester: enrollments.semester,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(grades, eq(grades.enrollmentId, enrollments.id))
    .where(eq(enrollments.studentId, student.id));

  return data;
}

export async function getInstructorCourses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "instructor") return null;

  const instructor = await db.query.instructors.findFirst({
    where: eq(instructors.userId, user.id),
  });

  if (!instructor) return [];

  const data = await db
    .select()
    .from(courses)
    .where(eq(courses.instructorId, instructor.id));

  return data;
}

export async function getUsersForSharing() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Fetch users to share with (excluding self)
  return await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(ne(users.id, user.id));
}

export async function shareResource(
  resourceId: number,
  resourceType: string,
  targetUserId: string,
  permission: "read" | "write"
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.insert(dacShares).values({
    resourceId,
    resourceType,
    ownerId: user.id,
    sharedWithId: targetUserId,
    permission,
  });
}

// Admin Actions
export async function getAllUsers() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;

  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
      securityLevel: users.securityLevel,
      createdAt: users.createdAt,
    })
    .from(users);
}

export async function getAdminStats() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;

  const { sql } = await import("drizzle-orm");

  const [userCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  const [studentCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students);
  const [instructorCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(instructors);
  const [courseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courses);

  return {
    totalUsers: userCount?.count || 0,
    totalStudents: studentCount?.count || 0,
    totalInstructors: instructorCount?.count || 0,
    totalCourses: courseCount?.count || 0,
  };
}

export async function getAuditLogs(limit: number = 50) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;

  return await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.timestamp))
    .limit(limit);
}

// Department Head Actions
export async function getDepartmentCourses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "department_head") return null;

  if (!user.department) return [];

  return await db
    .select()
    .from(courses)
    .where(eq(courses.department, user.department));
}

export async function getDepartmentStudents() {
  const user = await getCurrentUser();
  if (!user || user.role !== "department_head") return null;

  if (!user.department) return [];

  return await db
    .select({
      studentId: students.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      year: students.year,
      enrollmentStatus: students.enrollmentStatus,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(users.department, user.department));
}

// Registrar Actions
export async function getAllStudents() {
  const user = await getCurrentUser();
  if (!user || user.role !== "registrar") return null;

  return await db
    .select({
      studentId: students.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      department: users.department,
      year: students.year,
      enrollmentStatus: students.enrollmentStatus,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id));
}

export async function getAllCourses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "registrar") return null;

  return await db
    .select({
      id: courses.id,
      code: courses.code,
      title: courses.title,
      department: courses.department,
      instructorName: users.name,
    })
    .from(courses)
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .leftJoin(users, eq(instructors.userId, users.id));
}

export async function getAllEnrollments() {
  const user = await getCurrentUser();
  if (!user || user.role !== "registrar") return null;

  return await db
    .select({
      enrollmentId: enrollments.id,
      studentName: users.name,
      courseCode: courses.code,
      courseTitle: courses.title,
      semester: enrollments.semester,
      grade: grades.grade,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(grades, eq(grades.enrollmentId, enrollments.id));
}

export async function disable2FA() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({
      mfaEnabled: false,
      mfaSecret: null,
      backupCodes: null,
    })
    .where(eq(users.id, user.id));
}
