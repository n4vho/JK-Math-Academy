import { NextRequest, NextResponse } from "next/server";
import { clearStudentSession } from "@/lib/student-session";

export async function POST(request: NextRequest) {
  try {
    await clearStudentSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student logout error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
