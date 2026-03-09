import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect old /api/webbeds/all-hotels to new /api/hotels/list
 * This maintains backward compatibility while using the new API
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityCode = searchParams.get("cityCode");

  return NextResponse.json(
    {
      message: "API endpoint has moved to /api/hotels/list",
      newEndpoint: `/api/hotels/list${cityCode ? `?cityCode=${cityCode}` : ""}`
    },
    { status: 301 }
  );
}
