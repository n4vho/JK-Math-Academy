import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/student-session";
import { CreateNoticeSchema } from "@/lib/validators/notice";
import { sendNoticePush } from "@/src/lib/push/sendNoticePush";

function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

function parsePublishAt(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("admin_session");
    const isAdmin = adminSession?.value === "1";

    let where: any = {};

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
        where = { OR: audienceFilters };
      } else {
        // TEMP: Public/guardian feed (no user mapping yet)
        // TODO: Replace with real RBAC (guardian/staff role mapping).
        where = {
          OR: [
            { audienceType: "ALL" },
            { audienceType: "GUARDIAN_ONLY" },
          ],
        };
      }
    }

    const notices = await prisma.notice.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { publishAt: "desc" },
      ],
    });

    return NextResponse.json({ notices });
  } catch (error) {
    console.error("Get notices error:", error);
    return jsonError("An error occurred while fetching notices");
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Admin/staff only (admin_session until real RBAC exists)
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return jsonError("Unauthorized", 401);
    }

    const body = await request.json();
    const validationResult = CreateNoticeSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.errors);
    }

    const {
      title,
      body: content,
      type,
      audienceType,
      audienceRefId,
      isPinned,
      publishAt,
      attachmentUrl,
    } = validationResult.data;

    if (["BATCH", "CLASS", "STUDENT"].includes(audienceType) && !audienceRefId) {
      return jsonError("audienceRefId is required for this audienceType", 400);
    }

    const parsedPublishAt = parsePublishAt(publishAt);
    if (publishAt && !parsedPublishAt) {
      return jsonError("publishAt must be a valid ISO datetime", 400);
    }

    // TODO: Use authenticated user once real RBAC is implemented
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        body: content.trim(),
        type,
        audienceType,
        audienceRefId: audienceRefId?.trim() || null,
        isPinned: isPinned ?? false,
        publishAt: parsedPublishAt ?? undefined,
        attachmentUrl: attachmentUrl?.trim() || null,
        createdByUserId: adminUser?.id ?? null,
      },
    });

    void sendNoticePush({
      id: notice.id,
      title: notice.title,
      audienceType: notice.audienceType,
      audienceRefId: notice.audienceRefId,
    });

    return NextResponse.json({ success: true, notice }, { status: 201 });
  } catch (error) {
    console.error("Create notice error:", error);
    return jsonError("An error occurred while creating the notice");
  }
}
