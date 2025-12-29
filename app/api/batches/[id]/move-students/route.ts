import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceBatchId } = await params;
    const body = await request.json();
    const { studentIds, targetBatchId } = body;

    // Validation
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Student IDs array is required" },
        { status: 400 }
      );
    }

    if (!targetBatchId || typeof targetBatchId !== "string") {
      return NextResponse.json(
        { error: "Target batch ID is required" },
        { status: 400 }
      );
    }

    // Verify source batch exists
    const sourceBatch = await prisma.batch.findUnique({
      where: { id: sourceBatchId },
    });

    if (!sourceBatch) {
      return NextResponse.json(
        { error: "Source batch not found" },
        { status: 404 }
      );
    }

    // Verify target batch exists
    const targetBatch = await prisma.batch.findUnique({
      where: { id: targetBatchId },
    });

    if (!targetBatch) {
      return NextResponse.json(
        { error: "Target batch not found" },
        { status: 404 }
      );
    }

    // Verify all students exist and belong to source batch
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        batchId: sourceBatchId,
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "One or more students not found in source batch" },
        { status: 400 }
      );
    }

    // Move students to target batch
    await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
      },
      data: {
        batchId: targetBatchId,
      },
    });

    return NextResponse.json(
      { success: true, movedCount: studentIds.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Move students between batches error:", error);
    return NextResponse.json(
      { error: "An error occurred while moving students between batches" },
      { status: 500 }
    );
  }
}
