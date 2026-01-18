import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/student-session";

function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSession = request.cookies.get("admin_session");
    const isAdmin = adminSession?.value === "1";

    let where: any = { id };

    if (!isAdmin) {
      const studentId = await getStudentSession();

      if (studentId) {
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
        where = { id, OR: audienceFilters };
      } else {
        // TEMP: Public/guardian feed (no user mapping yet)
        // TODO: Replace with real RBAC (guardian/staff role mapping).
        where = {
          id,
          OR: [
            { audienceType: "ALL" },
            { audienceType: "GUARDIAN_ONLY" },
          ],
        };
      }
    }

    const notice = await prisma.notice.findFirst({ where });

    if (!notice) {
      return jsonError("Notice not found", 404);
    }

    return NextResponse.json({ notice });
  } catch (error) {
    console.error("Get notice error:", error);
    return jsonError("An error occurred while fetching the notice");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const notice = await prisma.notice.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!notice) {
      return jsonError("Notice not found", 404);
    }

    await prisma.notice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notice error:", error);
    return jsonError("An error occurred while deleting the notice");
  }
}
