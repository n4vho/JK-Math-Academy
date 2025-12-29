import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the enrollment request
    const enrollmentRequest = await prisma.enrollmentRequest.findUnique({
      where: { id },
    });

    if (!enrollmentRequest) {
      return NextResponse.json(
        { error: "Enrollment request not found" },
        { status: 404 }
      );
    }

    // Check if already approved or rejected
    if (enrollmentRequest.status === "APPROVED") {
      return NextResponse.json(
        { error: "Request is already approved" },
        { status: 400 }
      );
    }

    if (enrollmentRequest.status === "REJECTED") {
      return NextResponse.json(
        { error: "Request is already rejected" },
        { status: 400 }
      );
    }

    // Update enrollment request to REJECTED
    const updatedRequest = await prisma.enrollmentRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json(
      { success: true, enrollmentRequest: updatedRequest },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reject enrollment request error:", error);
    return NextResponse.json(
      { error: "An error occurred while rejecting the enrollment request" },
      { status: 500 }
    );
  }
}
