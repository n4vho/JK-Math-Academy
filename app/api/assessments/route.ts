import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendAssessmentPush } from "@/src/lib/push/sendAssessmentPush";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { batchId, title, subject, date, maxMarks } = body;

    // Validation
    if (!batchId || typeof batchId !== "string" || batchId.trim().length === 0) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    if (typeof maxMarks !== "number" || maxMarks <= 0) {
      return NextResponse.json(
        { error: "Max marks must be a positive number" },
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

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        batchId: batchId.trim(),
        title: title.trim(),
        subject: subject.trim(),
        date: new Date(date),
        maxMarks: Math.floor(maxMarks),
      },
    });

    void sendAssessmentPush({
      id: assessment.id,
      title: assessment.title,
      batchId: assessment.batchId,
    });

    return NextResponse.json(
      { success: true, assessment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create assessment error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    // Handle foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid batch ID" },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error.message?.includes("connect") || error.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 503 }
      );
    }

    // Return more detailed error message in development
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error.message || "An error occurred while creating the assessment"
      : "An error occurred while creating the assessment";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
