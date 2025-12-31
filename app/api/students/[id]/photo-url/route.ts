import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseSignedUrl } from "@/lib/supabase";
import { getStudentSession } from "@/lib/student-session";

/**
 * GET /api/students/[id]/photo-url
 * Get a signed URL for a student's photo (for private buckets)
 * This endpoint refreshes signed URLs when they expire
 * 
 * SECURITY: Only accessible by:
 * - The student themselves (via session)
 * - Admin users (via admin_session cookie)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication - must be either the student themselves or an admin
    const studentSessionId = await getStudentSession();
    const adminSession = request.cookies.get("admin_session");
    const isAdmin = adminSession?.value === "1";
    const isOwnProfile = studentSessionId === id;

    // SECURITY: Only allow access if user is the student themselves or an admin
    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id },
      select: { photoUrl: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (!student.photoUrl) {
      return NextResponse.json(
        { error: "Student has no photo" },
        { status: 404 }
      );
    }

    // Check if it's a Supabase signed URL (private bucket)
    const isSupabaseUrl = student.photoUrl.includes("supabase.co/storage");
    const isSignedUrl = student.photoUrl.includes("/storage/v1/object/sign/");

    // If it's already a signed URL and not expired, return it
    // Otherwise, if it's a Supabase URL but not signed, generate a new signed URL
    if (isSupabaseUrl && !isSignedUrl) {
      // Extract bucket and path from the stored URL
      // Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const urlParts = student.photoUrl.split("/storage/v1/object/public/");
      if (urlParts.length === 2) {
        const bucketAndPath = urlParts[1];
        const [bucket, ...pathParts] = bucketAndPath.split("/");
        const path = pathParts.join("/");

        // Generate new signed URL (valid for 1 year)
        const signedUrl = await getSupabaseSignedUrl(bucket, path, 60 * 60 * 24 * 365);
        return NextResponse.json({ photoUrl: signedUrl });
      }
    }

    // Return the stored URL as-is (public URL or already signed)
    return NextResponse.json({ photoUrl: student.photoUrl });
  } catch (error: any) {
    console.error("Get photo URL error:", error);
    return NextResponse.json(
      { error: "An error occurred while getting the photo URL" },
      { status: 500 }
    );
  }
}
