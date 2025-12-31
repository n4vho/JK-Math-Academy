// DEV ONLY: Simple middleware to protect /admin/* routes
// This will be replaced with proper authentication middleware later
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session verification for student routes (using Web Crypto API for Edge Runtime)
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 * 1000; // 30 days in milliseconds

/**
 * Verifies student session token using Web Crypto API (Edge Runtime compatible)
 */
async function verifyStudentSessionToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const [studentId, timestamp, hmac] = parts;
    const data = `${studentId}:${timestamp}`;

    // Convert secret to ArrayBuffer for Web Crypto API
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate expected HMAC
    const signature = await crypto.subtle.sign(
      "HMAC",
      secretKey,
      encoder.encode(data)
    );

    // Convert to hex string
    const expectedHmac = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hmac !== expectedHmac) return false;

    // Check expiration
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > SESSION_MAX_AGE) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* routes except /admin itself and /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin" && pathname !== "/admin/login") {
    const adminSession = request.cookies.get("admin_session");

    // If no admin session cookie, redirect to admin login
    if (!adminSession || adminSession.value !== "1") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow admin login page to be accessed
  if (pathname === "/admin/login") {
    const adminSession = request.cookies.get("admin_session");

    // If already logged in, redirect to admin dashboard
    if (adminSession && adminSession.value === "1") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Redirect old /login route to /admin/login
  if (pathname === "/login") {
    const loginUrl = new URL("/admin/login", request.url);
    if (request.nextUrl.searchParams.has("redirect")) {
      loginUrl.searchParams.set("redirect", request.nextUrl.searchParams.get("redirect")!);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Protect all /student/* routes except /student/login
  if (pathname.startsWith("/student") && pathname !== "/student/login") {
    const studentSession = request.cookies.get("student_session");

    // If no valid student session, redirect to login
    const isValid = studentSession?.value 
      ? await verifyStudentSessionToken(studentSession.value)
      : false;

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("Middleware check for:", pathname);
      console.log("Cookie present:", !!studentSession?.value);
      console.log("Token valid:", isValid);
    }

    if (!isValid) {
      const loginUrl = new URL("/student/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in as student, redirect from login page
  if (pathname === "/student/login") {
    const studentSession = request.cookies.get("student_session");
    if (studentSession?.value && await verifyStudentSessionToken(studentSession.value)) {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/student/:path*"],
};
