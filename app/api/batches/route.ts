import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Get batches error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { name, description } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Batch name is required" },
        { status: 400 }
      );
    }

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        name: name.trim(),
        ...(description ? { description: description.trim() } : {}),
      },
    });

    return NextResponse.json(
      { success: true, batch },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create batch error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A batch with this name already exists" },
        { status: 409 }
      );
    }

    // Handle database connection errors
    if (error.message?.includes("connect") || error.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 503 }
      );
    }

    // Return more detailed error message in development
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error.message || "An error occurred while creating the batch"
      : "An error occurred while creating the batch";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

