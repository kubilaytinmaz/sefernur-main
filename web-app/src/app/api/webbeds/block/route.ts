import { WEBBEDS_CONFIG } from "@/lib/webbeds/config";
import { buildBlockRoomXML } from "@/lib/webbeds/xml-builder";
import { parseWebBedsXML } from "@/lib/webbeds/xml-parser";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// POST /api/webbeds/block - Block a room (15-minute hold)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelId,
      checkIn,
      checkOut,
      rooms,
      roomTypeCode,
      selectedRateBasis,
      allocationDetails,
      nationality = 5,
      currency = 520,
    } = body;

    if (!hotelId || !checkIn || !checkOut || !roomTypeCode || !allocationDetails) {
      return NextResponse.json(
        { error: "Missing required fields: hotelId, checkIn, checkOut, roomTypeCode, allocationDetails" },
        { status: 400 },
      );
    }

    const xmlRequest = buildBlockRoomXML({
      hotelId,
      checkIn,
      checkOut,
      rooms: rooms || [{ adults: 2, children: 0, childAges: [] }],
      roomTypeCode,
      selectedRateBasis: selectedRateBasis || "0",
      allocationDetails,
      nationality,
      currency,
    });

    const response = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlRequest, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Accept": "text/xml",
        "Accept-Encoding": "gzip, deflate",
      },
      timeout: 60000,
    });

    const parsedData = parseWebBedsXML(response.data);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WebBeds block error:", error);
    return NextResponse.json(
      {
        error: "Failed to block room",
        message,
      },
      { status: 500 },
    );
  }
}
