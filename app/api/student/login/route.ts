import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionToken, normalizePhone } from "@/lib/student-session";
import { z } from "zod";

// Validation schema for login
const loginSchema = z.object({
  registrationNo: z.string().min(1, "Registration number is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { registrationNo, phone } = validationResult.data;

    // Look up Student by registrationNo
    const student = await prisma.student.findUnique({
      where: { registrationNo: registrationNo.trim() },
    });

    // Generic error for security (don't reveal if student exists)
    if (!student) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Normalize and compare phone numbers
    const normalizedInputPhone = normalizePhone(phone);
    const normalizedStudentPhone = student.phone ? normalizePhone(student.phone) : null;

    // If student has no phone on file, reject login
    if (!normalizedStudentPhone) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare normalized phone strings
    if (normalizedInputPhone !== normalizedStudentPhone) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Phone matches - set student session
    const token = createSessionToken(student.id);
    const response = NextResponse.json({ success: true });
    
    // Set cookie on response
    response.cookies.set("student_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Debug: log token creation (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Student login successful, token created for:", student.id);
    }

    return response;
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
