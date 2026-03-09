import { WEBBEDS_CONFIG } from "@/lib/webbeds/config";
import { buildSearchHotelsXML } from "@/lib/webbeds/xml-builder";
import { extractHotelsFromSearchResponse, parseWebBedsXML } from "@/lib/webbeds/xml-parser";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const V4_HEADERS = {
  "Content-Type": "text/xml; charset=utf-8",
  Accept: "text/xml",
  "Accept-Encoding": "gzip, deflate",
};

// Holy sites coordinates for distance calculation
const HOLY_SITES = {
  164: { lat: 21.4225, lng: 39.8262, name: "Kabe" },
  174: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" },
} as const;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

type HotelObj = Record<string, unknown>;

/**
 * Search hotels across multiple date ranges to discover ALL available hotels
 */
async function searchAllDates(cityCode: number): Promise<Map<string, HotelObj>> {
  const hotelMap = new Map<string, HotelObj>();
  
  // Search across different date ranges to discover all hotels
  const today = new Date();
  const dateRanges: Array<{ checkIn: string; checkOut: string }> = [];
  
  // Generate date ranges: every 2 weeks for the next 6 months
  for (let i = 0; i < 12; i++) {
    const checkInDate = new Date(today);
    checkInDate.setDate(checkInDate.getDate() + (i * 14));
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    
    dateRanges.push({
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
    });
  }

  console.log(`[All Hotels] Searching ${dateRanges.length} date ranges for cityCode: ${cityCode}`);

  // Run searches in parallel (max 3 concurrent)
  const batchSize = 3;
  for (let i = 0; i < dateRanges.length; i += batchSize) {
    const batch = dateRanges.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(async (range) => {
        const xml = buildSearchHotelsXML({
          cityCode,
          checkIn: range.checkIn,
          checkOut: range.checkOut,
          rooms: [{ adults: 2, children: 0, childAges: [] }],
          nationality: 5,
          currency: 520,
        });

        const resp = await axios.post(WEBBEDS_CONFIG.baseUrl, xml, {
          headers: V4_HEADERS,
          timeout: 30000,
        });

        return resp.data;
      })
    );

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      try {
        const parsed = parseWebBedsXML(result.value);
        const hotels = extractHotelsFromSearchResponse(parsed);
        for (const hotel of hotels) {
          const id = String(hotel["@_HotelId"] || "");
          if (id && !hotelMap.has(id)) {
            hotelMap.set(id, hotel);
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    console.log(`[All Hotels] After batch ${Math.floor(i / batchSize) + 1}: ${hotelMap.size} unique hotels found`);
  }

  return hotelMap;
}

// GET /api/webbeds/all-hotels - Get ALL hotels for a city across all dates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityCode = searchParams.get("cityCode");
    
    if (!cityCode) {
      return NextResponse.json(
        { error: "cityCode is required" },
        { status: 400 }
      );
    }

    const cityCodeNum = parseInt(cityCode, 10);
    console.log(`[All Hotels] Fetching ALL hotels for cityCode: ${cityCodeNum}`);

    const hotelMap = await searchAllDates(cityCodeNum);
    let hotels = Array.from(hotelMap.values());

    console.log(`[All Hotels] Total unique hotels found: ${hotels.length}`);

    // Calculate distance to holy site if applicable
    const holySite = HOLY_SITES[cityCodeNum as keyof typeof HOLY_SITES];
    if (holySite) {
      hotels = hotels.map((hotel) => {
        const lat = parseFloat(String(hotel["@_Lat"] || "0"));
        const lng = parseFloat(String(hotel["@_Lng"] || "0"));
        if (lat && lng) {
          const distanceKm = calculateDistance(lat, lng, holySite.lat, holySite.lng);
          const distanceM = Math.round(distanceKm * 1000);
          return {
            ...hotel,
            "@_DistanceToHolySite": distanceM,
            "@_HolySiteName": holySite.name,
            "@_DistanceText": distanceM < 1000
              ? `${distanceM} m`
              : `${(distanceKm).toFixed(1)} km`,
          };
        }
        return hotel;
      });
    }

    return NextResponse.json({
      success: true,
      cityCode: cityCodeNum,
      count: hotels.length,
      data: hotels,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("All hotels fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch all hotels",
        message,
      },
      { status: 500 }
    );
  }
}
