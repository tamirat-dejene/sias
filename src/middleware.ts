import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // RuBAC: Time-based access control (8:00 AM - 6:00 PM)
  // Only apply to protected routes
  if (path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/student") || path.startsWith("/instructor")) {
    const now = new Date();
    const hour = now.getHours();
    // Note: Timezone handling might be needed in real app, using server time here
    if (hour < 8 || hour >= 18) {
      // Allow access for now to avoid locking myself out during dev, 
      // but in production this would be:
      // return NextResponse.redirect(new URL("/access-denied?reason=time", request.url));
      console.log("RuBAC Warning: Accessing outside business hours");
    }
  }

  // For Better Auth, we usually use the client-side hooks or server-side session check in pages/layouts.
  // However, for strict middleware protection:
  const sessionCookie = request.cookies.get("better-auth.session_token");
  
  if (!sessionCookie && (path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/student") || path.startsWith("/instructor"))) {
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
    "/registrar/:path*"
  ],
};
