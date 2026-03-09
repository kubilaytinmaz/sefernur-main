import { getCheckInTime, getCheckOutTime, getHotelDescription } from "@/lib/hotels/hotel-metadata";
import { WEBBEDS_CONFIG } from "@/lib/webbeds/config";
import { buildSearchByIdsXML } from "@/lib/webbeds/xml-builder";
import {
  extractHotelsFromSearchResponse,
  parseWebBedsXML,
} from "@/lib/webbeds/xml-parser";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const V4_HEADERS = {
  "Content-Type": "text/xml; charset=utf-8",
  Accept: "text/xml",
  "Accept-Encoding": "gzip, deflate",
};

/**
 * Get detailed hotel information including all images
 * Uses WebBeds V4 searchByIds with fields parameter
 * 
 * POST /api/webbeds/hotel/[hotelId]
 * Body: { hotelId, checkIn, checkOut, nationality?, currency? }
 */
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
      nationality = 5,
      currency = 520,
    } = body;

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required fields: hotelId, checkIn, checkOut" },
        { status: 400 }
      );
    }

    // Build XML request for hotel details with images
    const xmlRequest = buildSearchByIdsXML({
      hotelIds: [hotelId],
      checkIn,
      checkOut,
      nationality,
      currency,
    });

    const response = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlRequest, {
      headers: V4_HEADERS,
      timeout: 30000,
    });

    const parsedData = parseWebBedsXML(response.data);
    
    // Debug: log the full structure to understand API response
    const resultObj = parsedData["result"] as Record<string, unknown> | undefined;
    if (resultObj) {
      console.log("[Hotel Detail API] result keys:", Object.keys(resultObj));
      const hotelsNode = resultObj["hotels"] as Record<string, unknown> | undefined;
      if (hotelsNode) {
        console.log("[Hotel Detail API] hotels keys:", Object.keys(hotelsNode));
        const hotelNode = hotelsNode["hotel"];
        if (hotelNode && typeof hotelNode === "object") {
          const h = Array.isArray(hotelNode) ? hotelNode[0] : hotelNode;
          console.log("[Hotel Detail API] hotel keys:", Object.keys(h as object));
        }
      } else {
        console.log("[Hotel Detail API] No 'hotels' under result. Looking for single 'hotel'...");
        const singleHotel = resultObj["hotel"] as Record<string, unknown> | undefined;
        if (singleHotel) {
          console.log("[Hotel Detail API] Single hotel keys:", Object.keys(singleHotel));
          console.log("[Hotel Detail API] Single hotel JSON (1000 chars):", JSON.stringify(singleHotel).substring(0, 1000));
        }
      }
    }
    
    const hotels = extractHotelsFromSearchResponse(parsedData);

    console.log("[Hotel Detail API] hotelId:", hotelId, "hotels found:", hotels.length);
    if (hotels.length > 0) {
      console.log("[Hotel Detail API] First hotel keys:", Object.keys(hotels[0]));
      console.log("[Hotel Detail API] checkInTime:", hotels[0]["checkInTime"], "checkOutTime:", hotels[0]["checkOutTime"]);
      console.log("[Hotel Detail API] description:", (hotels[0] as any)["description1"] || (hotels[0] as any)["description"]);
    }

    if (hotels.length === 0) {
      return NextResponse.json(
        { success: false, error: "Hotel not found" },
        { status: 404 }
      );
    }

    const hotel = hotels[0];

    // Extract all images from hotelImages.image array
    const images: string[] = [];
    const hotelImages = hotel["hotelImages"];
    
    if (hotelImages && typeof hotelImages === "object") {
      // Get thumb image
      const thumb = (hotelImages as any).thumb;
      if (thumb && typeof thumb === "string" && thumb.startsWith("http")) {
        images.push(thumb);
      }
      
      // Get all images from array
      const imageArray = (hotelImages as any).image;
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        for (const img of imageArray) {
          if (typeof img === "object" && img.url && typeof img.url === "string") {
            images.push(img.url);
          } else if (typeof img === "string" && img.startsWith("http")) {
            images.push(img);
          }
        }
      }
    }

    // Fallback to @_Image if no images found
    if (images.length === 0) {
      const directImage = hotel["@_Image"];
      if (directImage && typeof directImage === "string" && directImage.startsWith("http")) {
        images.push(directImage);
      }
    }

    // Remove duplicates while preserving order
    const uniqueImages = Array.from(new Set(images));

    // Use metadata fallbacks for check-in/out times and description
    const apiDescription = hotel["description1"] || hotel["description"];
    const apiCheckIn = hotel["checkInTime"];
    const apiCheckOut = hotel["checkOutTime"];

    return NextResponse.json({
      success: true,
      data: {
        hotelId: hotel["@_HotelId"] || hotelId,
        hotelName: hotel["@_HotelName"] || hotel["hotelName"],
        address: hotel["@_Address"] || hotel["address"],
        fullAddress: hotel["fullAddress"],
        stars: hotel["@_Stars"] || hotel["stars"],
        rating: hotel["rating"],
        description: getHotelDescription(hotelId, typeof apiDescription === "string" ? apiDescription : undefined),
        images: uniqueImages,
        geoPoint: hotel["geoPoint"],
        cityName: hotel["@_CityName"] || hotel["cityName"],
        cityCode: hotel["@_CityCode"] || hotel["cityCode"],
        countryName: hotel["@_CountryName"] || hotel["countryName"],
        countryCode: hotel["@_CountryCode"] || hotel["countryCode"],
        checkInTime: getCheckInTime(hotelId, typeof apiCheckIn === "string" ? apiCheckIn : undefined),
        checkOutTime: getCheckOutTime(hotelId, typeof apiCheckOut === "string" ? apiCheckOut : undefined),
      },
    });
  } catch (error) {
    console.error("WebBeds hotel detail error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch hotel details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
