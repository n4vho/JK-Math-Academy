import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Generates a unique registration number in format YYYY-####
 * Sequence resets per year
 */
async function generateRegistrationNo(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString();

  // Find the highest registration number for the current year
  const lastStudent = await prisma.student.findFirst({
    where: {
      registrationNo: {
        startsWith: yearPrefix + "-",
      },
    },
    orderBy: {
      registrationNo: "desc",
    },
  });

  let nextNumber = 1;

  if (lastStudent) {
    // Extract the number part (e.g., "0001" from "2025-0001")
    const parts = lastStudent.registrationNo.split("-");
    if (parts.length === 2 && parts[0] === yearPrefix) {
      const lastNumber = parseInt(parts[1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
  }

  // Format as YYYY-#### (4 digits with leading zeros)
  const registrationNo = `${yearPrefix}-${nextNumber.toString().padStart(4, "0")}`;

  return registrationNo;
}

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

    // Generate registration number with retry logic for uniqueness
    let registrationNo: string;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      registrationNo = await generateRegistrationNo();

      // Check if this registration number already exists
      const existing = await prisma.student.findUnique({
        where: { registrationNo },
      });

      if (!existing) {
        break; // Found a unique registration number
      }

      attempts++;
      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: "Failed to generate unique registration number" },
          { status: 500 }
        );
      }
    }

    // Create student and update enrollment request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Double-check uniqueness within transaction
      const existing = await tx.student.findUnique({
        where: { registrationNo: registrationNo! },
      });

      if (existing) {
        throw new Error("Registration number collision detected");
      }

      // Create student from enrollment request data
      const student = await tx.student.create({
        data: {
          registrationNo: registrationNo!,
          fullName: enrollmentRequest.studentName.trim(),
          phone: enrollmentRequest.phone?.trim() || null,
          school: enrollmentRequest.school?.trim() || null,
          grade: enrollmentRequest.grade?.trim() || null,
          status: "ACTIVE",
        },
      });

      // Update enrollment request to APPROVED and link to student
      const updatedRequest = await tx.enrollmentRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          convertedStudentId: student.id,
        },
      });

      return { student, enrollmentRequest: updatedRequest };
    });

    return NextResponse.json(
      { success: true, student: result.student, enrollmentRequest: result.enrollmentRequest },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Approve enrollment request error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002" || error.message?.includes("collision")) {
      return NextResponse.json(
        { error: "Registration number collision. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while approving the enrollment request" },
      { status: 500 }
    );
  }
}
