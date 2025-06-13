// middleware.ts - Production recommended approach
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only do basic token presence check in middleware
  // Full verification happens in API routes and components
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Let the token through - verification happens in useAuth hook
    return NextResponse.next();
  }

  // For login page - just check if token exists
  if (pathname === "/login") {
    const token = request.cookies.get("auth-token")?.value;

    if (token) {
      // Let the app handle verification - redirect for now
      const dashboardUrl = new URL("/admin", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
