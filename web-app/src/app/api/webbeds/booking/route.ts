import { WEBBEDS_CONFIG } from "@/lib/webbeds/config";
import { buildBookingXML } from "@/lib/webbeds/xml-builder";
import { parseWebBedsXML } from "@/lib/webbeds/xml-parser";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// POST /api/webbeds/booking - Confirm booking after block
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelId,
      checkIn,
      checkOut,
      currency = 520,
      customerReference,
      roomTypeCode,
      selectedRateBasis,
      allocationDetails,
      adults = 2,
      childrenAges = [],
      leadPassenger,
      specialRequests,
    } = body;

    if (!hotelId || !checkIn || !checkOut || !roomTypeCode || !allocationDetails || !leadPassenger) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Map title string to DOTW salutation code
    const salutationMap: Record<string, number> = { Mr: 1, Mrs: 2, Ms: 3, Miss: 4 };
    const salutation = salutationMap[leadPassenger.title] ?? 1;

    const xmlRequest = buildBookingXML({
      hotelId,
      checkIn,
      checkOut,
      currency,
      customerReference: customerReference || `SEFWEB-${Date.now()}`,
      roomTypeCode,
      selectedRateBasis: selectedRateBasis || "0",
      allocationDetails,
      adultsCode: adults,
      actualAdults: adults,
      childrenAges,
      leadPassenger: {
        salutation,
        firstName: leadPassenger.firstName,
        lastName: leadPassenger.lastName,
      },
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
    console.error("WebBeds booking error:", error);
    return NextResponse.json(
      {
        error: "Failed to confirm booking",
        message,
      },
      { status: 500 },
    );
  }
}
