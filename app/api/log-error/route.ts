import { NextResponse } from "next/server";

// This endpoint helps log client-side errors to server logs
// In production, check your hosting platform's logs for these messages
export async function POST(request: Request) {
  try {
    const errorData = await request.json();
    
    // Log to server console - this will appear in your hosting platform's logs
    console.error("Client-side error logged:", {
      timestamp: new Date().toISOString(),
      digest: errorData.digest,
      message: errorData.message,
      name: errorData.name,
      stack: errorData.stack,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging endpoint failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
