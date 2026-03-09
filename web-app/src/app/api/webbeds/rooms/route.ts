import { getCheckInTime, getCheckOutTime, getHotelDescription } from "@/lib/hotels/hotel-metadata";
import { WEBBEDS_CONFIG } from "@/lib/webbeds/config";
import { buildGetRoomsXML } from "@/lib/webbeds/xml-builder";
import {
  extractRoomsFromResponse,
  parseWebBedsXML,
} from "@/lib/webbeds/xml-parser";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// POST /api/webbeds/rooms - Get available rooms for a hotel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelId,
      checkIn,
      checkOut,
      rooms,
      nationality = 5,
      currency = 520,
    } = body;

    if (!hotelId || !checkIn || !checkOut || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const xmlRequest = buildGetRoomsXML({
      hotelId,
      checkIn,
      checkOut,
      rooms,
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
    const roomsData = extractRoomsFromResponse(parsedData);

    console.log(`[rooms API] hotelId=${hotelId}, found ${roomsData.length} room options`);
    if (roomsData.length > 0) {
      console.log("[rooms API] first room:", JSON.stringify(roomsData[0], null, 2).slice(0, 500));
    }

    // Extract hotel-level details from getrooms response (result > hotel)
    const v4Hotel = parsedData?.["result"] && typeof parsedData["result"] === "object"
      ? (parsedData["result"] as Record<string, unknown>)["hotel"]
      : undefined;
    
    let hotelInfo: Record<string, unknown> | undefined;
    if (v4Hotel && typeof v4Hotel === "object" && !Array.isArray(v4Hotel)) {
      const h = v4Hotel as Record<string, unknown>;
      
      // Extract check-in/out times and description from API
      const apiCheckInTime = h["checkInTime"] ?? h["checkintime"];
      const apiCheckOutTime = h["checkOutTime"] ?? h["checkouttime"];
      const apiDescription = h["description1"] ?? h["description"];
      // @_name comes from V4 getrooms response (hotel attribute) - this is the primary source
      const apiHotelName = h["@_name"] ?? h["hotelName"] ?? h["name"];
      
      console.log("[rooms API] Hotel-level keys:", Object.keys(h).join(", "));
      console.log("[rooms API] @_name:", h["@_name"], "hotelName:", h["hotelName"]);
      console.log("[rooms API] checkInTime:", apiCheckInTime, "checkOutTime:", apiCheckOutTime);
      console.log("[rooms API] description:", typeof apiDescription === "string" ? apiDescription.substring(0, 200) : apiDescription);
      
      // Use metadata fallbacks for check-in/out times, description, and hotel name
      hotelInfo = {
        checkInTime: getCheckInTime(hotelId, typeof apiCheckInTime === "string" ? apiCheckInTime : undefined),
        checkOutTime: getCheckOutTime(hotelId, typeof apiCheckOutTime === "string" ? apiCheckOutTime : undefined),
        description: getHotelDescription(hotelId, typeof apiDescription === "string" ? apiDescription : undefined),
        hotelName: typeof apiHotelName === "string" ? apiHotelName : undefined,
      };
    } else {
      // No hotel info in API response, use metadata defaults
      hotelInfo = {
        checkInTime: getCheckInTime(hotelId),
        checkOutTime: getCheckOutTime(hotelId),
        description: getHotelDescription(hotelId),
      };
    }

    return NextResponse.json({
      success: true,
      data: roomsData,
      count: roomsData.length,
      hotelInfo,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WebBeds rooms error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch rooms",
        message,
      },
      { status: 500 },
    );
  }
}
