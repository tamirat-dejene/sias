import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { like, or, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = db.select().from(users);

    if (search) {
      query = query.where(
        or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
      ) as any;
    }

    const allUsers = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Remove sensitive data
    const sanitizedUsers = allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      securityLevel: user.securityLevel,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
