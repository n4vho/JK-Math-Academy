import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadFile, deleteFile, generateStudentPhotoFilename } from "@/lib/storage";

/**
 * POST /api/admin/students/[id]/photo
 * Upload a photo for a student (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication (simple cookie check for MVP)
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const filename = generateStudentPhotoFilename(id, file.name);

    // Upload file
    let photoUrl: string;
    try {
      photoUrl = await uploadFile(buffer, filename, file.type);
    } catch (uploadError: any) {
      console.error("File upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Delete old photo if it exists
    if (student.photoUrl) {
      try {
        await deleteFile(student.photoUrl);
      } catch (deleteError) {
        // Log but don't fail - old file might not exist
        console.warn("Failed to delete old photo:", deleteError);
      }
    }

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { photoUrl },
    });

    return NextResponse.json(
      {
        success: true,
        student: {
          id: updatedStudent.id,
          photoUrl: updatedStudent.photoUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/students/[id]/photo
 * Delete a student's photo (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // Delete photo file if it exists
    if (student.photoUrl) {
      try {
        await deleteFile(student.photoUrl);
      } catch (deleteError) {
        // Log but don't fail - file might not exist
        console.warn("Failed to delete photo file:", deleteError);
      }
    }

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { photoUrl: null },
    });

    return NextResponse.json(
      {
        success: true,
        student: {
          id: updatedStudent.id,
          photoUrl: updatedStudent.photoUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the photo" },
      { status: 500 }
    );
  }
}
