import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect old /api/webbeds/block to new /api/hotels/[hotelId]/block
 * This maintains backward compatibility while using the new API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelId } = body;

    if (!hotelId) {
      return NextResponse.json(
        { success: false, error: "hotelId is required" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "API endpoint has moved to /api/hotels/[hotelId]/block",
        newEndpoint: `/api/hotels/${hotelId}/block`
      },
      { status: 301 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
