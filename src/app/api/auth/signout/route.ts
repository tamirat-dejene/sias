import { NextRequest, NextResponse } from "next/server";
import { invalidateSession } from "@/lib/auth-utils";
import { logAction } from "@/lib/audit-logger";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (session) {
      await logAction(session.user.id, "LOGOUT", "auth", {
        email: session.user.email,
      });
    }

    const token = request.cookies.get("session_token")?.value;

    if (token) {
      await invalidateSession(token);
    }

    const response = NextResponse.json({ success: true });

    // Clear cookie
    response.cookies.delete("session_token");
    response.cookies.delete("mfa_pending_token");

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
