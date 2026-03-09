import { webBedsClient } from "@/lib/webbeds/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const body = await request.json();
    const { hotelId } = await params;

    const {
      checkIn,
      checkOut,
      rooms,
      roomTypeCode,
      selectedRateBasis,
      allocationDetails,
      nationality = 5,
      currency = 520,
    } = body;

    // Validate required fields
    if (!checkIn || !checkOut || !rooms || !roomTypeCode || !selectedRateBasis) {
      return NextResponse.json(
        { success: false, error: "Eksik parametreler: checkIn, checkOut, rooms, roomTypeCode, selectedRateBasis gerekli" },
        { status: 400 }
      );
    }

    // Call blockRoom from WebBeds client
    const blockResponse = await webBedsClient.blockRoom({
      hotelId,
      checkIn,
      checkOut,
      rooms,
      roomTypeCode,
      selectedRateBasis,
      allocationDetails,
      nationality,
      currency,
    });

    return NextResponse.json(blockResponse);
  } catch (error) {
    console.error("Block room error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Oda bloklama başarısız oldu",
      },
      { status: 500 }
    );
  }
}
