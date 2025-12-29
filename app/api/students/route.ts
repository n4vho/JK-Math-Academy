import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const excludeBatchId = searchParams.get("excludeBatchId");

    if (!search || search.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const where: any = {
      AND: [
        {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { registrationNo: { contains: search, mode: "insensitive" } },
          ],
        },
      ],
    };

    // Exclude students already in the specified batch
    if (excludeBatchId) {
      where.AND.push({
        OR: [
          { batchId: { not: excludeBatchId } },
          { batchId: null },
        ],
      });
    }

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        registrationNo: true,
        fullName: true,
      },
      take: 20, // Limit results
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Search students error:", error);
    return NextResponse.json(
      { error: "An error occurred while searching students" },
      { status: 500 }
    );
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, phone, school, grade, status, photoUrl, batchId } = body;

    // Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ["ACTIVE", "PAUSED", "GRADUATED", "DROPPED"];
    const studentStatus = status || "ACTIVE";
    if (!validStatuses.includes(studentStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Validate batchId if provided
    if (batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });
      if (!batch) {
        return NextResponse.json(
          { error: "Invalid batch ID" },
          { status: 400 }
        );
      }
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

    // Create student in a transaction
    const student = await prisma.$transaction(async (tx) => {
      // Double-check uniqueness within transaction
      const existing = await tx.student.findUnique({
        where: { registrationNo: registrationNo! },
      });

      if (existing) {
        throw new Error("Registration number collision detected");
      }

      return await tx.student.create({
        data: {
          registrationNo: registrationNo!,
          fullName: fullName.trim(),
          phone: phone?.trim() || null,
          school: school?.trim() || null,
          grade: grade?.trim() || null,
          status: studentStatus as any,
          photoUrl: photoUrl?.trim() || null,
          batchId: batchId || null,
        },
      });
    });

    return NextResponse.json(
      { success: true, student },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create student error:", error);
    
    // Handle unique constraint violation
    if (error.code === "P2002" || error.message?.includes("collision")) {
      return NextResponse.json(
        { error: "Registration number collision. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while creating the student" },
      { status: 500 }
    );
  }
}

