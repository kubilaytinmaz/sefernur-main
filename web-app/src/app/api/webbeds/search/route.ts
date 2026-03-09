import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect old /api/webbeds/search to new /api/hotels/search
 * This maintains backward compatibility while using the new API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL("/api/hotels/search", request.url);

    return NextResponse.json(
      { message: "API endpoint has moved to /api/hotels/search", newEndpoint: "/api/hotels/search" },
      { status: 301 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
