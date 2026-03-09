import { WEBBEDS_CONFIG } from "@/lib/webbeds/config";
import { buildSearchByIdsWithPriceXML, buildSearchHotelsXML } from "@/lib/webbeds/xml-builder";
import {
  extractHotelsFromSearchResponse,
  parseWebBedsXML,
} from "@/lib/webbeds/xml-parser";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SIZE = 50; // DOTW best practice: max 50 hotel IDs per request

const V4_HEADERS = {
  "Content-Type": "text/xml; charset=utf-8",
  Accept: "text/xml",
  "Accept-Encoding": "gzip, deflate",
};

// Holy sites coordinates for distance calculation
const HOLY_SITES = {
  164: { lat: 21.4225, lng: 39.8262, name: "Mescid-i Haram" }, // Mekke
  174: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" }, // Medine
} as const;

type HotelObj = Record<string, unknown>;

/**
 * Fetch hotel metadata (name, address, images) for a batch of hotel IDs.
 * Uses noPrice + fields + hotelId filter (matching mobile's searchHotelsStatic).
 */
async function fetchHotelDetails(
  hotelIds: string[],
  checkIn: string,
  checkOut: string,
  currency: number,
): Promise<Map<string, HotelObj>> {
  const detailMap = new Map<string, HotelObj>();

  // Split into batches of BATCH_SIZE
  const batches: string[][] = [];
  for (let i = 0; i < hotelIds.length; i += BATCH_SIZE) {
    batches.push(hotelIds.slice(i, i + BATCH_SIZE));
  }

  // Fetch all batches in parallel
  // Use withPrice (no noPrice) because V4 API returns error code 26 with noPrice + fields
  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      const xmlWithPrice = buildSearchByIdsWithPriceXML({ hotelIds: batch, checkIn, checkOut, currency });
      const resp = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlWithPrice, {
        headers: V4_HEADERS,
        timeout: 30000,
      });
      return resp.data;
    }),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") {
      console.warn("[fetchHotelDetails] Batch failed:", result.reason);
      continue;
    }
    try {
      // Debug: log raw XML (first 500 chars)
      const rawXml = String(result.value);
      console.log("[fetchHotelDetails] Raw XML (first 500 chars):", rawXml.substring(0, 500));
      
      const parsed = parseWebBedsXML(result.value);
      // Debug: log raw XML structure
      console.log("[fetchHotelDetails] Parsed XML keys:", Object.keys(parsed));
      console.log("[fetchHotelDetails] Parsed result keys:", parsed["result"] ? Object.keys(parsed["result"] as any) : "no result");
      
      const hotels = extractHotelsFromSearchResponse(parsed);
      console.log("[fetchHotelDetails] Extracted hotels:", hotels.length);
      for (const hotel of hotels) {
        const id = String(hotel["@_HotelId"] || "");
        const name = String(hotel["@_HotelName"] || "");
        console.log("[fetchHotelDetails] Hotel:", { id, name });
        if (id) detailMap.set(id, hotel);
      }
    } catch (e) {
      console.error("[fetchHotelDetails] Parse error:", e);
    }
  }

  return detailMap;
}

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

// Known DOTW city name mappings for filtering when using country-level search
const CITY_NAME_FILTERS: Record<number, string[]> = {
  365: ["madinah", "medina", "medine", "al madinah", "al-madinah", "al medina"],
};

// POST /api/webbeds/search - Search hotels
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
      filterByCityCode, // Used when searching by country but wanting city-specific results
    } = body;

    // Debug log for Medina
    console.log("[WebBeds Search] Request params:", { cityCode, countryCode, filterByCityCode });

    // Validate required fields - either cityCode or countryCode must be provided
    if ((!cityCode && !countryCode) || !checkIn || !checkOut || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Phase 1: Get hotel IDs + pricing (fast, city/country-filtered)
    const xmlRequest = buildSearchHotelsXML({
      cityCode,
      countryCode,
      checkIn,
      checkOut,
      rooms,
      nationality,
      currency,
    });

    const response = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlRequest, {
      headers: V4_HEADERS,
      timeout: 60000,
    });

    const parsedData = parseWebBedsXML(response.data);
    let pricedHotels = extractHotelsFromSearchResponse(parsedData);
    console.log("[WebBeds Search] Phase 1 — priced hotels:", pricedHotels.length);

    if (pricedHotels.length === 0) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    // Phase 2: SKIPPED - WebBeds V4 API doesn't support hotelId filter with fields
    // Hotel names will be fetched from rooms API on hotel detail page
    // The rooms API response includes @_name field with correct hotel names
    console.log("[WebBeds Search] Phase 2 — SKIPPED (hotel names from rooms API)");
    
    // Use Phase 1 hotels directly
    let mergedHotels = pricedHotels;

    // Filter by city name if we're doing a country-level search for a specific city
    // This is needed for cities like Medina where DOTW doesn't support direct city search
    const targetCityCode = filterByCityCode || 0;
    const cityNameFilters = CITY_NAME_FILTERS[targetCityCode];
    if (cityNameFilters && countryCode && mergedHotels.length > 0) {
      const beforeCount = mergedHotels.length;
      mergedHotels = mergedHotels.filter((hotel) => {
        const cityName = String(
          hotel["@_CityName"] || hotel["@_cityname"] || hotel["cityName"] || ""
        ).toLowerCase().trim();
        const address = String(
          hotel["@_Address"] || hotel["address"] || ""
        ).toLowerCase().trim();
        
        return cityNameFilters.some((filter) =>
          cityName.includes(filter) || address.includes(filter)
        );
      });
      console.log(`[WebBeds Search] City filter applied for ${targetCityCode}: ${beforeCount} → ${mergedHotels.length}`);
    }

    // Calculate distance to holy site if applicable (only if we have hotels)
    const holySite = HOLY_SITES[cityCode as keyof typeof HOLY_SITES];
    if (holySite && mergedHotels.length > 0) {
      mergedHotels = mergedHotels.map((hotel) => {
        const lat = parseFloat(String(hotel["@_Lat"] || "0"));
        const lng = parseFloat(String(hotel["@_Lng"] || "0"));
        if (lat && lng) {
          const distanceKm = calculateDistance(lat, lng, holySite.lat, holySite.lng);
          const distanceM = Math.round(distanceKm * 1000);
          return {
            ...hotel,
            "@_DistanceToHolySite": distanceM, // meters
            "@_HolySiteName": holySite.name,
            "@_DistanceText": distanceM < 1000
              ? `${distanceM} m`
              : `${(distanceKm).toFixed(1)} km`,
          };
        }
        return hotel;
      });
    }

    // Phase 3: Enrich with Google Places ratings (optional, non-blocking)
    try {
      const hotelsForGoogle = mergedHotels.slice(0, 10).map((hotel) => ({
        id: String(hotel["@_HotelId"] || ""),
        name: String(hotel["@_HotelName"] || ""),
        lat: parseFloat(String(hotel["@_Lat"] || hotel["lat"] || "0")),
        lng: parseFloat(String(hotel["@_Lng"] || hotel["lng"] || "0")),
      })).filter((h) => h.id && h.name);

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
          mergedHotels = mergedHotels.map((hotel) => {
            const hotelId = String(hotel["@_HotelId"] || "");
            const googleRating = ratingsMap.get(hotelId);
            if (googleRating && typeof googleRating === "object") {
              const rating = (googleRating as any).googleRating;
              const reviewCount = (googleRating as any).googleReviewCount;
              const placeId = (googleRating as any).googlePlaceId;
              return {
                ...hotel,
                "@_GuestRating": rating ? String(rating) : undefined,
                "@_ReviewCount": reviewCount ? String(reviewCount) : undefined,
                "@_GooglePlaceId": placeId ? String(placeId) : undefined,
              };
            }
            return hotel;
          });
          console.log("[WebBeds Search] Phase 3 — Google ratings enriched:", ratingsMap.size);
        }
      }
    } catch (error) {
      console.warn("[WebBeds Search] Google Places enrichment failed (non-critical):", error instanceof Error ? error.message : "Unknown");
    }

    return NextResponse.json({
      success: true,
      data: mergedHotels,
      count: mergedHotels.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WebBeds search error:", error);
    return NextResponse.json(
      {
        error: "Failed to search hotels",
        message,
      },
      { status: 500 },
    );
  }
}
