import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    // Create enrollment request
    const enrollmentRequest = await prisma.enrollmentRequest.create({
      data: {
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
