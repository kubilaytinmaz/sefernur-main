import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect old /api/webbeds/hotel/[hotelId] to new /api/hotels/[hotelId]
 * This maintains backward compatibility while using the new API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  const { hotelId } = await params;
  return NextResponse.json(
    {
      message: "API endpoint has moved to /api/hotels/[hotelId] (GET method)",
      newEndpoint: `/api/hotels/${hotelId}`
    },
    { status: 301 }
  );
}
