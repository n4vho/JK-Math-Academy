import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;
    const body = await request.json();
    const { studentIds } = body;

    // Validation
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Student IDs array is required" },
        { status: 400 }
      );
    }

    // Verify batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    // Verify all students exist
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "One or more students not found" },
        { status: 400 }
      );
    }

    // Assign students to batch
    await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
      },
      data: {
        batchId: batchId,
      },
    });

    return NextResponse.json(
      { success: true, assignedCount: studentIds.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Assign students to batch error:", error);
    return NextResponse.json(
      { error: "An error occurred while assigning students to batch" },
      { status: 500 }
    );
  }
}
