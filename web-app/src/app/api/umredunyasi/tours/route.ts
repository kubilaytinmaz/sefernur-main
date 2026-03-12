/**
 * UmreDunyasi Tours API Route
 *
 * Server-side proxy endpoint for UmreDunyasi tours API.
 * Handles CORS, caching, and error handling.
 *
 * Endpoint: GET /api/umredunyasi/tours
 *
 * Query Parameters:
 * - limit: number (default: 6) - Number of tours to fetch
 * - featured: boolean - Fetch featured tours instead
 * - bestByFirm: boolean - Fetch best tours by firm
 * - economic: boolean - Fetch economic tours
 * - long: boolean - Fetch long tours (14+ days)
 *
 * @example
 * ```ts
 * // Fetch upcoming tours
 * const response = await fetch('/api/umredunyasi/tours?limit=6');
 * const data = await response.json();
 * ```
 */

import { umredunyasiClient } from "@/lib/umredunyasi";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for UmreDunyasi tours proxy
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const featured = searchParams.get("featured") === "true";
    const bestByFirm = searchParams.get("bestByFirm") === "true";
    const economic = searchParams.get("economic") === "true";
    const long = searchParams.get("long") === "true";

    // Validate limit
    const validLimit = Math.min(Math.max(1, limit), 50);

    let tours;

    // Route to appropriate endpoint based on query params
    if (featured) {
      tours = await umredunyasiClient.getFeaturedTours(validLimit);
    } else if (bestByFirm) {
      tours = await umredunyasiClient.getBestToursByFirm(validLimit);
    } else if (economic) {
      tours = await umredunyasiClient.getEconomicTours(validLimit);
    } else if (long) {
      tours = await umredunyasiClient.getLongTours(validLimit);
    } else {
      // Default: upcoming tours
      tours = await umredunyasiClient.getUpcomingTours(validLimit);
    }

    const duration = Date.now() - startTime;

    // Log success (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[UmreDunyasi API] Success: ${tours.length} tours fetched in ${duration}ms`
      );
    }

    return NextResponse.json({
      success: true,
      data: tours,
      count: tours.length,
      meta: {
        duration: `${duration}ms`,
        cached: false,
        source: "umredunyasi",
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error
    console.error("[UmreDunyasi API] Error:", error);

    // Return graceful error response (not 500, to avoid breaking UI)
    return NextResponse.json(
      {
        success: false,
        error: "Turlar geçici olarak alınamıyor",
        data: [],
        count: 0,
        meta: {
          duration: `${duration}ms`,
          fallback: true,
          source: "umredunyasi",
        },
      },
      { status: 200 } // Return 200 even on error, UI will handle gracefully
    );
  }
}

/**
 * Route segment config for caching
 */
export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes
