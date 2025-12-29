import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    // Fetch assessment with batch
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Fetch all students in the batch
    const students = await prisma.student.findMany({
      where: {
        batchId: assessment.batchId,
      },
      select: {
        id: true,
        registrationNo: true,
        fullName: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    // Fetch existing scores for this assessment
    const scores = await prisma.assessmentScore.findMany({
      where: {
        assessmentId: assessmentId,
      },
      select: {
        id: true,
        studentId: true,
        score: true,
        remarks: true,
      },
    });

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        subject: assessment.subject,
        date: assessment.date.toISOString(),
        maxMarks: assessment.maxMarks,
        batch: assessment.batch,
      },
      students,
      scores,
    });
  } catch (error: any) {
    console.error("Get assessment data error:", error);

    // Handle database connection errors
    if (error.message?.includes("connect") || error.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while fetching assessment data" },
      { status: 500 }
    );
  }
}
