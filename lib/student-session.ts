import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Session configuration
 * Using HMAC-signed tokens for low-security student sessions
 */
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";
const SESSION_COOKIE_NAME = "student_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Creates a signed session token containing studentId
 * Format: studentId:timestamp:hmac
 */
export function createSessionToken(studentId: string): string {
  const timestamp = Date.now().toString();
  const data = `${studentId}:${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
  return `${data}:${hmac}`;
}

/**
 * Verifies and extracts studentId from a session token
 * Returns null if token is invalid or expired
 */
function verifySessionToken(token: string): string | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return null;

    const [studentId, timestamp, hmac] = parts;
    const data = `${studentId}:${timestamp}`;

    // Verify HMAC
    const expectedHmac = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("hex");

    if (hmac !== expectedHmac) return null;

    // Check expiration (30 days)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > SESSION_MAX_AGE * 1000) return null;

    return studentId;
  } catch {
    return null;
  }
}

/**
 * Sets the student session cookie
 */
export async function setStudentSession(studentId: string): Promise<void> {
  const token = createSessionToken(studentId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Clears the student session cookie
 * Uses same settings as setStudentSession to ensure proper deletion
 */
export async function clearStudentSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  });
}

/**
 * Gets the current student session (studentId) from cookies
 * Returns null if no valid session exists
 */
export async function getStudentSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}

/**
 * Requires a valid student session
 * Throws an error that can be caught by Next.js error handling if no session
 * Use this in server components/actions that require authentication
 */
export async function requireStudentSession(): Promise<string> {
  const studentId = await getStudentSession();

  if (!studentId) {
    throw new Error("Unauthorized: Student session required");
  }

  return studentId;
}

/**
 * Normalizes phone numbers for comparison
 * Strips spaces, dashes, parentheses, and leading + signs
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, "").trim();
}
