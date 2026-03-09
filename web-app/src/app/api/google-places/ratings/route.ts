import { NextRequest, NextResponse } from "next/server";

/**
 * Google Places API ile otel puanlarını çeker.
 * Otel adı + konum bilgisi ile arama yaparak Google puanını döndürür.
 * 
 * POST /api/google-places/ratings
 * Body: { hotels: [{ id, name, lat?, lng? }] }
 */

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

interface HotelInput {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
}

interface PlaceResult {
  hotelId: string;
  googleRating?: number;
  googleReviewCount?: number;
  googlePlaceId?: string;
}

// In-memory cache for Google Places results (survives across requests within same process)
const ratingsCache = new Map<string, { rating: number; reviewCount: number; placeId: string; cachedAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function findPlaceRating(hotel: HotelInput): Promise<PlaceResult> {
  // Check cache first
  const cacheKey = `${hotel.name}_${hotel.lat}_${hotel.lng}`;
  const cached = ratingsCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return {
      hotelId: hotel.id,
      googleRating: cached.rating,
      googleReviewCount: cached.reviewCount,
      googlePlaceId: cached.placeId,
    };
  }

  try {
    // Use Text Search (New) API for better hotel matching
    const query = `${hotel.name} hotel`;
    
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=lodging&key=${GOOGLE_API_KEY}`;
    
    // Add location bias if coordinates available
    if (hotel.lat && hotel.lng) {
      url += `&location=${hotel.lat},${hotel.lng}&radius=5000`;
    }

    const response = await fetch(url, { 
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.warn(`[Google Places] HTTP ${response.status} for ${hotel.name}`);
      return { hotelId: hotel.id };
    }

    const data = await response.json();
    
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return { hotelId: hotel.id };
    }

    // Take the first (most relevant) result
    const place = data.results[0];
    const rating = place.rating;
    const reviewCount = place.user_ratings_total;
    const placeId = place.place_id;

    // Cache the result
    if (rating) {
      ratingsCache.set(cacheKey, {
        rating,
        reviewCount: reviewCount || 0,
        placeId: placeId || "",
        cachedAt: Date.now(),
      });
    }

    return {
      hotelId: hotel.id,
      googleRating: rating || undefined,
      googleReviewCount: reviewCount || undefined,
      googlePlaceId: placeId || undefined,
    };
  } catch (error) {
    console.warn(`[Google Places] Error for ${hotel.name}:`, error instanceof Error ? error.message : "Unknown");
    return { hotelId: hotel.id };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotels } = body as { hotels: HotelInput[] };

    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return NextResponse.json({ error: "Missing hotels array" }, { status: 400 });
    }

    if (!GOOGLE_API_KEY) {
      console.warn("[Google Places] No API key configured");
      return NextResponse.json({ success: true, ratings: [] });
    }

    // Limit to 10 hotels per request to avoid quota issues
    const limitedHotels = hotels.slice(0, 10);

    // Fetch ratings in parallel with a small concurrency limit
    const results = await Promise.allSettled(
      limitedHotels.map((hotel) => findPlaceRating(hotel))
    );

    const ratings = results
      .filter((r): r is PromiseFulfilledResult<PlaceResult> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((r) => r.googleRating !== undefined);

    return NextResponse.json({
      success: true,
      ratings,
    });
  } catch (error) {
    console.error("[Google Places] Route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
