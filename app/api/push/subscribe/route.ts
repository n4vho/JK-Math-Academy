import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/student-session";

function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const adminSession = request.cookies.get("admin_session");
  if (adminSession?.value === "1") {
    // TODO: Use authenticated admin user id once RBAC is implemented
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    return adminUser ? `admin:${adminUser.id}` : null;
  }

  const studentId = await getStudentSession();
  if (studentId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });
    return student ? `student:${student.id}` : null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const body = await request.json();
    const endpoint = body?.endpoint;
    const p256dh = body?.keys?.p256dh;
    const auth = body?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return jsonError("Invalid subscription payload", 400);
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh,
        auth,
        isEnabled: true,
      },
      create: {
        userId,
        endpoint,
        p256dh,
        auth,
        isEnabled: true,
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return jsonError("An error occurred while saving subscription");
  }
}
