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
      select: { id: true, batchId: true, grade: true },
    });
    return student ? `student:${student.id}` : null;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("admin_session");
    const isAdmin = adminSession?.value === "1";

    const userId = await resolveUserId(request);
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    let where: any = {};

    if (!isAdmin) {
      const studentId = await getStudentSession();
      if (!studentId) {
        return jsonError("Unauthorized", 401);
      }

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, batchId: true, grade: true },
      });

      if (!student) {
        return jsonError("Student not found", 404);
      }

      const audienceFilters: any[] = [
        { audienceType: "ALL" },
        { audienceType: "STUDENT", audienceRefId: student.id },
      ];

      if (student.batchId) {
        audienceFilters.push({
          audienceType: "BATCH",
          audienceRefId: student.batchId,
        });
      }

      if (student.grade) {
        audienceFilters.push({
          audienceType: "CLASS",
          audienceRefId: student.grade,
        });
      }

      // TODO: Map GUARDIAN_ONLY and STAFF_ONLY based on real RBAC.
      where = { OR: audienceFilters };
    }

    const unreadCount = await prisma.notice.count({
      where: {
        ...where,
        NOT: {
          reads: {
            some: { userId },
          },
        },
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Unread count error:", error);
    return jsonError("An error occurred while fetching unread count");
  }
}
