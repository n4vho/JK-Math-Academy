import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Generates a unique reference ID in format REQ-####
 * Sequence increments for each new request
 */
async function generateReferenceId(): Promise<string> {
  // Find the highest reference ID
  const lastRequest = await prisma.enrollmentRequest.findFirst({
    orderBy: {
      referenceId: "desc",
    },
  });

  let nextNumber = 1;

  if (lastRequest && lastRequest.referenceId) {
    // Extract the number part (e.g., "0001" from "REQ-0001")
    const parts = lastRequest.referenceId.split("-");
    if (parts.length === 2 && parts[0] === "REQ") {
      const lastNumber = parseInt(parts[1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
  }

  // Format as REQ-#### (4 digits with leading zeros)
  const referenceId = `REQ-${nextNumber.toString().padStart(4, "0")}`;

  return referenceId;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, phone, grade, school, subjects, message } = body;

    // Validation
    if (!studentName || typeof studentName !== "string" || studentName.trim().length === 0) {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate reference ID with retry logic for uniqueness
    let referenceId: string;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      referenceId = await generateReferenceId();

      // Check if this reference ID already exists
      const existing = await prisma.enrollmentRequest.findUnique({
        where: { referenceId },
      });

      if (!existing) {
        break; // Found a unique reference ID
      }

      attempts++;
      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: "Failed to generate unique reference ID" },
          { status: 500 }
        );
      }
    }

    // Create enrollment request
    const enrollmentRequest = await prisma.enrollmentRequest.create({
      data: {
        referenceId: referenceId!,
        studentName: studentName.trim(),
        phone: phone.trim(),
        grade: grade?.trim() || null,
        school: school?.trim() || null,
        subjects: subjects?.trim() || null,
        message: message?.trim() || null,
        status: "NEW",
      },
    });

    return NextResponse.json(
      { success: true, enrollmentRequest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create enrollment request error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting the enrollment request" },
      { status: 500 }
    );
  }
}
