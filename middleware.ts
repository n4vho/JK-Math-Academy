// DEV ONLY: Simple middleware to protect /admin/* routes
// This will be replaced with proper authentication middleware later
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* routes except /admin itself
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const adminSession = request.cookies.get("admin_session");

    // If no admin session cookie, redirect to login
    if (!adminSession || adminSession.value !== "1") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow login page to be accessed
  if (pathname === "/login") {
    const adminSession = request.cookies.get("admin_session");

    // If already logged in, redirect to admin/students
    if (adminSession && adminSession.value === "1") {
      return NextResponse.redirect(new URL("/admin/students", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

