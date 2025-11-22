import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { role } = await req.json();

    if (!["student", "instructor", "department_head", "registrar", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user role in database
    await db.update(users)
        .set({ role: role as any })
        .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, role });
}

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user from database
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id)
    });

    return NextResponse.json({ 
        sessionUser: session.user,
        dbUser: user 
    });
}
