import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Update status to DROPPED (archived)
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        status: "DROPPED",
      },
    });

    return NextResponse.json(
      { success: true, student: updatedStudent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Archive student error:", error);
    return NextResponse.json(
      { error: "An error occurred while archiving the student" },
      { status: 500 }
    );
  }
}

