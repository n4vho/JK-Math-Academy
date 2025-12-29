import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
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

    const { scores } = body;

    // Validation
    if (!Array.isArray(scores)) {
      return NextResponse.json(
        { error: "Scores must be an array" },
        { status: 400 }
      );
    }

    // Verify assessment exists and get maxMarks
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Validate and prepare scores for upsert
    const upsertData = scores.map((scoreData: any) => {
      const { studentId, score, remarks } = scoreData;

      if (!studentId || typeof studentId !== "string") {
        throw new Error("Invalid studentId in scores array");
      }

      // Validate score if provided
      const scoreValue = score === null || score === undefined || score === "" ? null : score;
      let scoreNum: number | null = null;

      if (scoreValue !== null) {
        scoreNum = typeof scoreValue === "string" ? parseFloat(scoreValue) : Number(scoreValue);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > assessment.maxMarks) {
          throw new Error(
            `Score for student ${studentId} must be between 0 and ${assessment.maxMarks}`
          );
        }
        scoreNum = Math.floor(scoreNum);
      }

      return {
        where: {
          assessmentId_studentId: {
            assessmentId: assessmentId,
            studentId: studentId,
          },
        },
        update: {
          score: scoreNum,
          remarks: remarks?.trim() || null,
        },
        create: {
          assessmentId: assessmentId,
          studentId: studentId,
          score: scoreNum,
          remarks: remarks?.trim() || null,
        },
      };
    });

    // Perform upserts in a transaction
    const results = await prisma.$transaction(
      upsertData.map((data) =>
        prisma.assessmentScore.upsert(data)
      )
    );

    return NextResponse.json(
      { success: true, count: results.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Save scores error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    // Handle validation errors
    if (error.message?.includes("must be between")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Handle foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid assessment or student ID" },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate score entry" },
        { status: 409 }
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
      ? error.message || "An error occurred while saving scores"
      : "An error occurred while saving scores";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
