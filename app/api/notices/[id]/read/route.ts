import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/student-session";

function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noticeId } = await params;

    const adminSession = request.cookies.get("admin_session");
    const isAdmin = adminSession?.value === "1";
    const studentId = await getStudentSession();

    if (!isAdmin && !studentId) {
      return jsonError("Unauthorized", 401);
    }

    let userId: string | null = null;

    if (isAdmin) {
      // TODO: Use authenticated admin user id once RBAC is implemented
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });
      userId = adminUser?.id ?? null;
    } else {
      userId = studentId;
    }

    if (!userId) {
      return jsonError("User not found", 404);
    }

    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      select: { id: true },
    });

    if (!notice) {
      return jsonError("Notice not found", 404);
    }

    const noticeRead = await prisma.noticeRead.upsert({
      where: {
        noticeId_userId: {
          noticeId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        noticeId,
        userId,
      },
    });

    return NextResponse.json({ success: true, noticeRead });
  } catch (error) {
    console.error("Mark notice read error:", error);
    return jsonError("An error occurred while marking notice as read");
  }
}
