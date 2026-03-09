/**
 * Hotels List API
 * 
 * GET /api/hotels/list?cityCode=164
 * 
 * Get ALL hotels in a city without pricing.
 * Returns hotel names, addresses, images, ratings, etc.
 * 
 * This is useful for:
 * - Building a hotel catalog
 * - Showing all available hotels in a city
 * - Pre-loading hotel data for search suggestions
 */

import { webBedsClient } from "@/lib/webbeds/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityCodeParam = searchParams.get("cityCode");
    
    if (!cityCodeParam) {
      return NextResponse.json(
        { error: "cityCode is required" },
        { status: 400 }
      );
    }

    const cityCode = parseInt(cityCodeParam, 10);

    // Use default dates (today + tomorrow) for the API call
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = today.toISOString().split("T")[0];
    const checkOut = tomorrow.toISOString().split("T")[0];

    console.log(`[Hotels List] Fetching all hotels for cityCode: ${cityCode}`);

    // Get all hotels in city (with details, no pricing)
    const result = await webBedsClient.getAllHotelsInCity({
      cityCode,
      checkIn,
      checkOut,
      nationality: 5,
      currency: 520,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to get hotels list",
          message: result.message,
        },
        { status: 500 }
      );
    }

    console.log(`[Hotels List] Returning ${result.data?.length || 0} hotels for cityCode: ${cityCode}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Hotels List] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get hotels list",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
