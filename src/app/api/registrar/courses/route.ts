import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courseList = await db.select().from(courses);

    return NextResponse.json({ courses: courseList });
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
