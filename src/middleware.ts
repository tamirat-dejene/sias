import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // RuBAC: Time-based access control (9:00 AM - 5:00 PM)
  // Strictly enforce for Registrar routes
  if (path.startsWith("/registrar")) {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sun, 6 = Sat

    // Weekdays 9-5 only
    if (day === 0 || day === 6 || hour < 9 || hour >= 17) {
      // In a real app, we'd redirect to an error page
      return NextResponse.redirect(
        new URL("/access-denied?reason=outside_hours", request.url)
      );
    }
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("session_token");

  if (
    !sessionCookie &&
    (path.startsWith("/dashboard") ||
      path.startsWith("/admin") ||
      path.startsWith("/student") ||
      path.startsWith("/instructor"))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Role-based checks would ideally happen here by decoding the token or fetching session.
  // For performance, we might decode a JWT if available, or fetch session.
  // Since we are using database sessions, fetching in middleware can be expensive.
  // We will delegate granular RBAC to the Layouts or Page components,
  // or use a lightweight session check if Better Auth provides one.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/student/:path*",
    "/instructor/:path*",
    "/department-head/:path*",
    "/registrar/:path*",
  ],
};
