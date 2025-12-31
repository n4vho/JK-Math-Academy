import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the enrollment request with related student data
    // Try by id first, then by referenceId
    let enrollmentRequest = await prisma.enrollmentRequest.findUnique({
      where: { id },
      include: {
        convertedStudent: {
          select: {
            id: true,
            registrationNo: true,
            fullName: true,
          },
        },
      },
    });

    // If not found by id, try by referenceId
    if (!enrollmentRequest) {
      enrollmentRequest = await prisma.enrollmentRequest.findUnique({
        where: { referenceId: id },
        include: {
          convertedStudent: {
            select: {
              id: true,
              registrationNo: true,
              fullName: true,
            },
          },
        },
      });
    }

    if (!enrollmentRequest) {
      return NextResponse.json(
        { error: "Enrollment request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        enrollmentRequest: {
          id: enrollmentRequest.id,
          referenceId: enrollmentRequest.referenceId,
          studentName: enrollmentRequest.studentName,
          phone: enrollmentRequest.phone,
          grade: enrollmentRequest.grade,
          school: enrollmentRequest.school,
          subjects: enrollmentRequest.subjects,
          message: enrollmentRequest.message,
          status: enrollmentRequest.status,
          registrationNo: enrollmentRequest.convertedStudent?.registrationNo || null,
          createdAt: enrollmentRequest.createdAt,
          updatedAt: enrollmentRequest.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get enrollment request error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the enrollment request" },
      { status: 500 }
    );
  }
}
