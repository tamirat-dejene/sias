import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

async function seed() {
  // Dynamically import db and schema to ensure env vars are loaded first
  const { db } = await import("@/lib/db");
  const {
    users,
    students,
    instructors,
    courses,
    enrollments,
    grades,
    dacShares,
    auditLogs,
    passwordHistory,
    passwordResets,
    sessions,
  } = await import("@/db/schema");

  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(grades);
  await db.delete(enrollments);
  await db.delete(dacShares);
  await db.delete(courses);
  await db.delete(students);
  await db.delete(instructors);
  await db.delete(auditLogs);
  await db.delete(sessions);
  await db.delete(passwordHistory);
  await db.delete(passwordResets);
  await db.delete(users);
  console.log("✅ Cleared existing data\n");

  // Create users with hashed passwords
  console.log("👥 Creating users...");

  const password = await hash("password123", 10);

  // Insert users
  const [student1User] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Alice Johnson",
      email: "alice.student@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "student",
      department: "Computer Science",
      securityLevel: "public",
    })
    .returning();

  const [student2User] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Bob Williams",
      email: "bob.student@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "student",
      department: "Mathematics",
      securityLevel: "public",
    })
    .returning();

  const [student3User] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Carol Davis",
      email: "carol.student@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "student",
      department: "Computer Science",
      securityLevel: "public",
    })
    .returning();

  const [instructor1User] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Dr. John Smith",
      email: "dr.smith@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "instructor",
      department: "Computer Science",
      securityLevel: "internal",
    })
    .returning();

  const [instructor2User] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Prof. Sarah Jones",
      email: "prof.jones@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "instructor",
      department: "Mathematics",
      securityLevel: "internal",
    })
    .returning();

  const [deptHeadUser] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Dr. Michael Chen",
      email: "head.cs@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "department_head",
      department: "Computer Science",
      securityLevel: "confidential",
    })
    .returning();

  const [registrarUser] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Emily Rodriguez",
      email: "registrar@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "registrar",
      securityLevel: "confidential",
    })
    .returning();

  const [adminUser] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "System Administrator",
      email: "admin@university.edu",
      passwordHash: password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "admin",
      securityLevel: "restricted",
    })
    .returning();

  console.log("✅ Created 8 users with passwords\n");

  // Create student records
  console.log("🎓 Creating student records...");
  const [studentRecord1] = await db
    .insert(students)
    .values({
      userId: student1User.id,
      year: 3,
      major: "Computer Science",
      enrollmentStatus: "active",
    })
    .returning();

  const [studentRecord2] = await db
    .insert(students)
    .values({
      userId: student2User.id,
      year: 2,
      major: "Mathematics",
      enrollmentStatus: "active",
    })
    .returning();

  const [studentRecord3] = await db
    .insert(students)
    .values({
      userId: student3User.id,
      year: 4,
      major: "Physics",
      enrollmentStatus: "active",
    })
    .returning();

  console.log("✅ Created 3 student records\n");

  // Create instructor records
  console.log("👨‍🏫 Creating instructor records...");
  const [instructorRecord1] = await db
    .insert(instructors)
    .values({
      userId: instructor1User.id,
    })
    .returning();

  const [instructorRecord2] = await db
    .insert(instructors)
    .values({
      userId: instructor2User.id,
    })
    .returning();

  console.log("✅ Created 2 instructor records\n");

  // Create courses
  console.log("📚 Creating courses...");
  const [course1] = await db
    .insert(courses)
    .values({
      code: "CS101",
      title: "Introduction to Computer Science",
      department: "Computer Science",
      credits: 3,
      instructorId: instructorRecord1.id,
      securityLevel: "internal",
    })
    .returning();

  const [course2] = await db
    .insert(courses)
    .values({
      code: "CS201",
      title: "Data Structures and Algorithms",
      department: "Computer Science",
      credits: 4,
      instructorId: instructorRecord1.id,
      securityLevel: "internal",
    })
    .returning();

  const [course3] = await db
    .insert(courses)
    .values({
      code: "CS301",
      title: "Database Systems",
      department: "Computer Science",
      credits: 3,
      instructorId: instructorRecord1.id,
      securityLevel: "internal",
    })
    .returning();

  const [course4] = await db
    .insert(courses)
    .values({
      code: "MATH201",
      title: "Linear Algebra",
      department: "Mathematics",
      credits: 3,
      instructorId: instructorRecord2.id,
      securityLevel: "internal",
    })
    .returning();

  const [course5] = await db
    .insert(courses)
    .values({
      code: "MATH301",
      title: "Discrete Mathematics",
      department: "Mathematics",
      credits: 3,
      instructorId: instructorRecord2.id,
      securityLevel: "internal",
    })
    .returning();

  console.log("✅ Created 5 courses\n");

  // Create enrollments
  console.log("📝 Creating enrollments...");

  const [enrollment1] = await db
    .insert(enrollments)
    .values({
      studentId: studentRecord1.id,
      courseId: course1.id,
      semester: "Fall 2024",
    })
    .returning();

  const [enrollment2] = await db
    .insert(enrollments)
    .values({
      studentId: studentRecord1.id,
      courseId: course2.id,
      semester: "Fall 2024",
    })
    .returning();

  const [enrollment3] = await db
    .insert(enrollments)
    .values({
      studentId: studentRecord1.id,
      courseId: course4.id,
      semester: "Spring 2025",
    })
    .returning();

  const [enrollment4] = await db
    .insert(enrollments)
    .values({
      studentId: studentRecord2.id,
      courseId: course4.id,
      semester: "Fall 2024",
    })
    .returning();

  const [enrollment5] = await db
    .insert(enrollments)
    .values({
      studentId: studentRecord2.id,
      courseId: course5.id,
      semester: "Fall 2024",
    })
    .returning();

  const [enrollment6] = await db
    .insert(enrollments)
    .values({
      studentId: studentRecord3.id,
      courseId: course3.id,
      semester: "Fall 2024",
    })
    .returning();

  const [enrollment7] = await db
    .insert(enrollments)
    .values({
      studentId: studentRecord3.id,
      courseId: course2.id,
      semester: "Spring 2025",
    })
    .returning();

  console.log("✅ Created 7 enrollments\n");

  // Create grades
  console.log("📊 Creating grades...");

  await db.insert(grades).values({
    enrollmentId: enrollment1.id,
    grade: "A",
    updatedBy: instructor1User.id,
    securityLevel: "confidential",
  });

  await db.insert(grades).values({
    enrollmentId: enrollment2.id,
    grade: "B+",
    updatedBy: instructor1User.id,
    securityLevel: "confidential",
  });

  await db.insert(grades).values({
    enrollmentId: enrollment4.id,
    grade: "A-",
    updatedBy: instructor2User.id,
    securityLevel: "confidential",
  });

  await db.insert(grades).values({
    enrollmentId: enrollment5.id,
    grade: "B",
    updatedBy: instructor2User.id,
    securityLevel: "confidential",
  });

  await db.insert(grades).values({
    enrollmentId: enrollment6.id,
    grade: "A",
    updatedBy: instructor1User.id,
    securityLevel: "confidential",
  });

  console.log("✅ Created 5 grades (2 enrollments pending)\n");

  // Create DAC shares
  console.log("🔐 Creating DAC shares...");

  await db.insert(dacShares).values({
    resourceType: "course",
    resourceId: course1.id,
    ownerId: instructor1User.id,
    sharedWithId: deptHeadUser.id,
    permission: "read",
  });

  await db.insert(dacShares).values({
    resourceType: "course",
    resourceId: course2.id,
    ownerId: instructor1User.id,
    sharedWithId: instructor2User.id,
    permission: "read",
  });

  console.log("✅ Created 2 DAC shares\n");

  console.log("🎉 Seed completed successfully!\n");
  console.log("📋 Summary:");
  console.log("   - 8 users created");
  console.log("   - 5 courses created");
  console.log("   - 7 enrollments created");
  console.log("   - 5 grades assigned (2 pending)");
  console.log("   - 2 DAC shares created");
  console.log("\n🔑 Login credentials (all users):");
  console.log("   Password: password123\n");
  console.log("   Students:");
  console.log("   - alice.student@university.edu");
  console.log("   - bob.student@university.edu");
  console.log("   - carol.student@university.edu");
  console.log("\n   Instructors:");
  console.log("   - dr.smith@university.edu");
  console.log("   - prof.jones@university.edu");
  console.log("\n   Department Head:");
  console.log("   - head.cs@university.edu");
  console.log("\n   Registrar:");
  console.log("   - registrar@university.edu");
  console.log("\n   Admin:");
  console.log("   - admin@university.edu\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
