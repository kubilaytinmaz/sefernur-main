import { buildBookingXML } from "@/lib/webbeds/xml-builder";
import { parseWebBedsXML } from "@/lib/webbeds/xml-parser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const body = await request.json();
    const { hotelId } = await params;

    const {
      checkIn,
      checkOut,
      currency = 520,
      customerReference,
      roomTypeCode,
      selectedRateBasis,
      allocationDetails,
      adults,
      childrenAges = [],
      leadPassenger,
      specialRequests,
    } = body;

    // Validate required fields
    if (
      !checkIn ||
      !checkOut ||
      !customerReference ||
      !roomTypeCode ||
      !selectedRateBasis ||
      !leadPassenger
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Eksik parametreler: checkIn, checkOut, customerReference, roomTypeCode, selectedRateBasis, leadPassenger gerekli",
        },
        { status: 400 }
      );
    }

    // Validate lead passenger
    if (
      !leadPassenger.title ||
      !leadPassenger.salutation ||
      !leadPassenger.firstName ||
      !leadPassenger.lastName ||
      !leadPassenger.email
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Eksik yolcu bilgileri: title, salutation, firstName, lastName, email gerekli",
        },
        { status: 400 }
      );
    }

    // Build booking XML
    const bookingXML = buildBookingXML({
      hotelId,
      checkIn,
      checkOut,
      currency,
      customerReference,
      roomTypeCode,
      selectedRateBasis,
      allocationDetails,
      adultsCode: adults, // adultsCode = number of adults for room type
      actualAdults: adults, // actualAdults = actual number of adults
      childrenAges,
      leadPassenger: {
        salutation: leadPassenger.salutation,
        firstName: leadPassenger.firstName,
        lastName: leadPassenger.lastName,
      },
    });

    // Send request to WebBeds
    const response = await fetch(
      "https://xml-uat.dotwconnect.com/gatewayV4.dotw",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "Accept-Encoding": "gzip, deflate",
        },
        body: bookingXML,
      }
    );

    if (!response.ok) {
      throw new Error(
        `WebBeds API hatası: ${response.status} ${response.statusText}`
      );
    }

    const xmlText = await response.text();
    const parsed = parseWebBedsXML(xmlText);

    // Extract booking result
    const result = parsed?.result as Record<string, unknown> | undefined;
    const error = (result?.request as Record<string, unknown> | undefined)
      ?.error as Record<string, unknown> | undefined;

    if (error) {
      const errorMsg =
        (error["@_description"] as string) ||
        (error["#text"] as string) ||
        "Rezervasyon oluşturulamadı";
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          data: parsed,
        },
        { status: 400 }
      );
    }

    // Extract booking reference and confirmation
    const bookingReference =
      (result?.["@_bookingReference"] as string) ||
      (result?.bookingReference as string);
    const confirmationNumber =
      (result?.["@_confirmationNumber"] as string) ||
      (result?.confirmationNumber as string);

    return NextResponse.json({
      success: true,
      data: {
        bookingReference,
        confirmationNumber,
        customerReference,
        rawResponse: parsed,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Rezervasyon işlemi başarısız oldu",
      },
      { status: 500 }
    );
  }
}
