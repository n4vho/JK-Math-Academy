import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Check admin authentication
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify batch exists
    const batch = await prisma.batch.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    // Delete batch (cascades will handle assessments, students will have batchId set to null)
    await prisma.batch.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Batch deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete batch error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the batch" },
      { status: 500 }
    );
  }
}
