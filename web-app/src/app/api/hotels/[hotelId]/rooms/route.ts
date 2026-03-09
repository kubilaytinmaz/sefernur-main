/**
 * Hotel Rooms API
 * 
 * POST /api/hotels/[hotelId]/rooms
 * 
 * Get available rooms and pricing for a specific hotel.
 * This is the V4 getRooms call that returns:
 * - All room types
 * - Rate options (board basis, pricing)
 * - Cancellation policies
 * - allocationDetails (required for booking)
 */

import { webBedsClient } from "@/lib/webbeds/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await params;
    const body = await request.json();
    
    const {
      checkIn,
      checkOut,
      rooms,
      nationality = 5,
      currency = 520,
    } = body;

    // Validation
    if (!hotelId || !checkIn || !checkOut || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`[Hotel Rooms] Request for hotel ${hotelId}:`, {
      checkIn,
      checkOut,
      rooms,
    });

    // Get rooms from WebBeds
    const result = await webBedsClient.getRooms({
      hotelId,
      checkIn,
      checkOut,
      rooms,
      nationality,
      currency,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to get rooms",
          message: result.message,
        },
        { status: 500 }
      );
    }

    console.log(`[Hotel Rooms] Found ${result.data?.rooms?.length || 0} room options for hotel ${hotelId}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Hotel Rooms] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get rooms",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
