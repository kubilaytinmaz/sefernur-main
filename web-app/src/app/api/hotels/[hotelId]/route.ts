/**
 * Hotel Detail API
 * 
 * GET /api/hotels/[hotelId]
 * 
 * Get detailed hotel information including:
 * - Hotel name, address, description
 * - Images
 * - Rating, stars
 * - Check-in/out times
 * - Geo location
 * 
 * Uses WebBeds getHotelsByIds with noPrice + fields to get static data.
 */

import { webBedsClient } from "@/lib/webbeds/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Optional: checkIn/checkOut for the API call (required by WebBeds)
    // Use default dates if not provided
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkIn = searchParams.get("checkIn") || today.toISOString().split("T")[0];
    const checkOut = searchParams.get("checkOut") || tomorrow.toISOString().split("T")[0];

    console.log(`[Hotel Detail] Request for hotel ${hotelId}`);

    // Get hotel details by ID
    const hotels = await webBedsClient.getHotelsByIds({
      hotelIds: [hotelId],
      checkIn,
      checkOut,
      nationality: 5,
      currency: 520,
    });

    if (hotels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Hotel not found",
        },
        { status: 404 }
      );
    }

    const hotel = hotels[0];

    // Extract ALL images from hotel
    // The normalized hotel now includes all images in the 'images' field
    const images: string[] = hotel.images && hotel.images.length > 0
      ? hotel.images
      : (hotel.image ? [hotel.image] : []);

    console.log(`[Hotel Detail] Found ${images.length} images for hotel ${hotelId}`);

    // Build response
    const response = {
      success: true,
      data: {
        hotelId: hotel.hotelId,
        hotelName: hotel.hotelName,
        description: hotel.description,
        address: hotel.address,
        cityName: hotel.cityName,
        cityCode: hotel.cityCode,
        countryName: hotel.countryName,
        countryCode: hotel.countryCode,
        stars: hotel.stars,
        rating: hotel.rating,
        images,
        geoPoint: hotel.lat && hotel.lng ? {
          lat: hotel.lat,
          lng: hotel.lng,
        } : undefined,
        checkInTime: hotel.checkInTime || "14:00",
        checkOutTime: hotel.checkOutTime || "12:00",
      },
    };

    console.log(`[Hotel Detail] Returning details for hotel ${hotelId}:`, hotel.hotelName);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Hotel Detail] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get hotel details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
