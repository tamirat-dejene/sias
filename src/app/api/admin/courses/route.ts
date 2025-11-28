import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAction } from "@/lib/audit-logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "registrar")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";

    let query = db.select().from(courses);

    const allCourses = await query;

    // Filter in memory for simplicity
    let filtered = allCourses;
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (department) {
      filtered = filtered.filter((c) => c.department === department);
    }

    return NextResponse.json({ courses: filtered });
  } catch (error) {
    console.error("Courses fetch error:", error);
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

    const { code, title, department, credits, instructorId } =
      await request.json();

    if (!code || !title || !department || !credits) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if course code already exists
    const [existing] = await db
      .select()
      .from(courses)
      .where(eq(courses.code, code))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Course code already exists" },
        { status: 400 }
      );
    }

    const [newCourse] = await db
      .insert(courses)
      .values({
        code,
        title,
        department,
        credits: parseInt(credits),
        instructorId: instructorId || null,
        securityLevel: "internal",
      })
      .returning();

    await logAction(session.user.id, "CREATE_COURSE", "courses", {
      courseId: newCourse.id,
      code,
      title,
    });

    return NextResponse.json({ course: newCourse });
  } catch (error) {
    console.error("Course creation error:", error);
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

    const { id, code, title, department, credits, instructorId } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(courses)
      .set({
        code,
        title,
        department,
        credits: credits ? parseInt(credits) : undefined,
        instructorId: instructorId || null,
      })
      .where(eq(courses.id, id))
      .returning();

    await logAction(session.user.id, "UPDATE_COURSE", "courses", {
      courseId: id,
      changes: { code, title, department, credits },
    });

    return NextResponse.json({ course: updated });
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    await db.delete(courses).where(eq(courses.id, parseInt(id)));

    await logAction(session.user.id, "DELETE_COURSE", "courses", {
      courseId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
