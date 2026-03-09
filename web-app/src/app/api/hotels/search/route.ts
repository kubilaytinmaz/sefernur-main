/**
 * Hotels Search API
 *
 * POST /api/hotels/search
 *
 * Two-phase search:
 * 1. Get hotel IDs + pricing from WebBeds (fast)
 * 2. Get hotel details (names, images, etc.) by IDs
 *
 * This ensures we get both pricing AND complete hotel information.
 */

import { webBedsClient } from "@/lib/webbeds/client";
import { NextRequest, NextResponse } from "next/server";

// Holy sites coordinates for distance calculation
const HOLY_SITES = {
  164: { lat: 21.4225, lng: 39.8262, name: "Mescid-i Haram" }, // Mekke
  174: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" }, // Medine
} as const;

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cityCode,
      countryCode,
      checkIn,
      checkOut,
      rooms,
      nationality = 5,
      currency = 520,
    } = body;

    // Validation
    if ((!cityCode && !countryCode) || !checkIn || !checkOut || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[Hotels Search] Request:", { cityCode, countryCode, checkIn, checkOut, rooms });

    // Phase 1: Get hotel IDs + pricing
    const searchResult = await webBedsClient.searchByCity({
      cityCode: cityCode || countryCode!,
      checkIn,
      checkOut,
      rooms,
      nationality,
      currency,
    });

    if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    console.log(`[Hotels Search] Phase 1: Found ${searchResult.data.length} hotels with pricing`);

    // Phase 2: Get hotel details by IDs
    const hotelIds = searchResult.data.map((h) => h.hotelId).filter(Boolean);
    
    if (hotelIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Get detailed hotel information
    const detailedHotels = await webBedsClient.getHotelsByIds({
      hotelIds,
      checkIn,
      checkOut,
      nationality,
      currency,
    });

    console.log(`[Hotels Search] Phase 2: Fetched details for ${detailedHotels.length} hotels`);

    // Merge pricing data with detailed data
    const pricingMap = new Map(
      searchResult.data.map((h) => [h.hotelId, h.price])
    );

    const mergedHotels = detailedHotels.map((hotel) => ({
      ...hotel,
      price: pricingMap.get(hotel.hotelId) || hotel.price,
    }));

    // Calculate distance to holy site if applicable
    const holySite = HOLY_SITES[cityCode as keyof typeof HOLY_SITES];
    if (holySite) {
      mergedHotels.forEach((hotel) => {
        if (hotel.lat && hotel.lng) {
          const lat = parseFloat(hotel.lat);
          const lng = parseFloat(hotel.lng);
          if (!isNaN(lat) && !isNaN(lng)) {
            const distanceKm = calculateDistance(lat, lng, holySite.lat, holySite.lng);
            const distanceM = Math.round(distanceKm * 1000);
            hotel.distanceToHolySite = distanceM;
            hotel.holySiteName = holySite.name;
            hotel.distanceText = distanceM < 1000
              ? `${distanceM} m`
              : `${distanceKm.toFixed(1)} km`;
          }
        }
      });
    }

    // Phase 3: Enrich with Google Places ratings (optional, non-blocking)
    try {
      const hotelsForGoogle = mergedHotels.slice(0, 10).map((hotel) => ({
        id: hotel.hotelId,
        name: hotel.hotelName,
        lat: hotel.lat ? parseFloat(hotel.lat) : 0,
        lng: hotel.lng ? parseFloat(hotel.lng) : 0,
      })).filter((h) => h.id && h.name && h.lat && h.lng);

      if (hotelsForGoogle.length > 0) {
        const googleResponse = await fetch(`${request.nextUrl.origin}/api/google-places/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotels: hotelsForGoogle }),
          signal: AbortSignal.timeout(5000),
        });

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          const ratingsMap = new Map(
            (googleData.ratings || []).map((r: any) => [r.hotelId, r])
          );

          // Merge Google ratings into hotel data
          mergedHotels.forEach((hotel) => {
            const googleRating = ratingsMap.get(hotel.hotelId);
            if (googleRating && typeof googleRating === "object") {
              const rating = (googleRating as any).googleRating;
              const reviewCount = (googleRating as any).googleReviewCount;
              if (rating) hotel.rating = rating.toString();
              if (reviewCount) hotel.reviewCount = reviewCount;
            }
          });

          console.log("[Hotels Search] Phase 3: Google ratings enriched");
        }
      }
    } catch (error) {
      console.warn("[Hotels Search] Google Places enrichment failed (non-critical):", error instanceof Error ? error.message : "Unknown");
    }

    return NextResponse.json({
      success: true,
      data: mergedHotels,
      count: mergedHotels.length,
    });
  } catch (error) {
    console.error("[Hotels Search] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to search hotels",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
