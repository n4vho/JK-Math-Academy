import { NextRequest, NextResponse } from "next/server";
import { uploadFile, generateNoticeAttachmentFilename } from "@/lib/storage";

const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const maxSize = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPG, and PNG are allowed." },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = generateNoticeAttachmentFilename(file.name);

    const attachmentUrl = await uploadFile(buffer, filename, file.type, "notices");

    return NextResponse.json({ attachmentUrl });
  } catch (error: any) {
    console.error("Notice upload error:", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the file" },
      { status: 500 }
    );
  }
}
