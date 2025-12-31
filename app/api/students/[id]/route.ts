import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Check admin authentication
    // This endpoint is used by admin pages but is not under /api/admin/
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        batch: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Get student error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the student" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Check admin authentication
    // This endpoint is used by admin pages but is not under /api/admin/
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { fullName, phone, school, grade, status, photoUrl, batchId } = body;

    // Verify student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Validation
    if (fullName !== undefined) {
      if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
        return NextResponse.json(
          { error: "Full name is required" },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ["ACTIVE", "PAUSED", "GRADUATED", "DROPPED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
    }

    // Validate batchId if provided
    if (batchId !== undefined && batchId !== null && batchId !== "") {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });
      if (!batch) {
        return NextResponse.json(
          { error: "Invalid batch ID" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone?.trim() || null;
    }
    if (school !== undefined) {
      updateData.school = school?.trim() || null;
    }
    if (grade !== undefined) {
      updateData.grade = grade?.trim() || null;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (photoUrl !== undefined) {
      updateData.photoUrl = photoUrl?.trim() || null;
    }
    if (batchId !== undefined) {
      updateData.batchId = batchId?.trim() || null;
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        batch: true,
      },
    });

    return NextResponse.json(
      { success: true, student: updatedStudent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update student error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A student with this information already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while updating the student" },
      { status: 500 }
    );
  }
}

