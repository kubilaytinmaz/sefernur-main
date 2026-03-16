/**
 * Exchange Rates API Endpoint
 * 
 * GET /api/exchange-rates - Güncel döviz kurlarını döndürür
 * POST /api/exchange-rates/sync - Manuel senkronizasyon
 */

import { getExchangeRatesFromFirestore, syncExchangeRates } from "@/lib/exchange-rates";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/exchange-rates
 * Güncel döviz kurlarını döndürür
 */
export async function GET() {
  try {
    const rates = await getExchangeRatesFromFirestore();
    
    if (!rates) {
      return NextResponse.json(
        { error: "Exchange rates not available yet. Please try syncing first." },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        usdTry: rates.usdTry,
        source: rates.source,
        updatedAt: rates.updatedAt.toISOString(),
        nextUpdateAt: rates.nextUpdateAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exchange-rates/sync
 * Manuel senkronizasyon
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization kontrolü (isteğe bağlı)
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.EXCHANGE_RATE_SYNC_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Döviz kurlarını senkronize et
    const rates = await syncExchangeRates();
    
    return NextResponse.json({
      success: true,
      message: "Exchange rates synced successfully",
      data: {
        usdTry: rates.usdTry,
        source: rates.source,
        updatedAt: rates.updatedAt.toISOString(),
        nextUpdateAt: rates.nextUpdateAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error syncing exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to sync exchange rates" },
      { status: 500 }
    );
  }
}
