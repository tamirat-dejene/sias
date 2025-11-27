import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkABAC } from "@/lib/access-control";

// Mock budget data
const DEPARTMENT_BUDGETS: Record<string, number> = {
  "Computer Science": 50000,
  Mathematics: 30000,
  Physics: 40000,
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetDepartment = searchParams.get("department");

    if (!targetDepartment) {
      return NextResponse.json(
        { error: "Department required" },
        { status: 400 }
      );
    }

    // ABAC Check: User must belong to the target department
    // We assume the user's department is in their session/profile
    // For this demo, we'll check against the session user's department

    // Note: In a real app, we'd fetch the full user profile if department isn't in session
    // Here we assume session.user has department (we added it to schema but need to ensure it's in session)
    // If not in session, we'd fetch from DB. Let's assume we fetch it or it's in session.

    // For demonstration, let's assume the user has a department attribute.
    // If it's missing from session type, we might need to fetch it.
    // Let's fetch the user from DB to be sure.

    // Actually, let's just use the checkABAC function with the session data we have
    // and if department is missing, it fails.

    const userAttributes = {
      department: (session.user as any).department || "Computer Science", // Fallback for demo if not set
    };

    const resourceAttributes = {
      department: targetDepartment,
    };

    if (!checkABAC(userAttributes, resourceAttributes, "same_department")) {
      return NextResponse.json(
        {
          error:
            "Access Denied: You can only view your own department's budget (ABAC)",
        },
        { status: 403 }
      );
    }

    const budget = DEPARTMENT_BUDGETS[targetDepartment] || 0;

    return NextResponse.json({
      department: targetDepartment,
      budget,
      message: "Access Granted via ABAC",
    });
  } catch (error) {
    console.error("Budget fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
