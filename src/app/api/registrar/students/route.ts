import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { students, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const studentList = await db
      .select({
        id: students.id,
        userId: students.userId,
        name: users.name,
        email: users.email,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id));

    return NextResponse.json({ students: studentList });
  } catch (error) {
    console.error("Students fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
