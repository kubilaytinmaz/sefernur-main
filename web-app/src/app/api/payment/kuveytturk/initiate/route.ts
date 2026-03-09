import {
    build3DPaymentXml,
    getKuveytTurkConfig,
    isKuveytTurkConfigReady,
    KuveytTurkCardPayload,
} from "@/lib/payment/kuveytturk";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface InitiateRequestBody {
  merchantOrderId: string;
  amount: number;
  currency: string;
  identityTaxNumber: string;
  email?: string;
  phoneNumber?: string;
  card: KuveytTurkCardPayload;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InitiateRequestBody;

    if (!body.merchantOrderId || !body.amount || !body.currency || !body.identityTaxNumber || !body.card) {
      return NextResponse.json(
        { error: "Eksik ödeme alanları" },
        { status: 400 },
      );
    }

    const config = getKuveytTurkConfig();
    if (!isKuveytTurkConfigReady(config)) {
      return NextResponse.json(
        { error: "KuveytTürk yapılandırması eksik" },
        { status: 500 },
      );
    }

    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const okUrl = process.env.KUVEYTTURK_OK_URL || `${origin}/api/payment/kuveytturk/callback`;
    const failUrl = process.env.KUVEYTTURK_FAIL_URL || `${origin}/api/payment/kuveytturk/callback`;

    const xmlRequest = build3DPaymentXml(config, {
      merchantOrderId: body.merchantOrderId,
      amount: body.amount,
      currency: body.currency,
      identityTaxNumber: body.identityTaxNumber,
      email: body.email,
      phoneNumber: body.phoneNumber,
      card: body.card,
      clientIp: getClientIp(request),
      okUrl,
      failUrl,
    });

    const response = await axios.post(`${config.baseUrl}/ThreeDModelPayGate`, xmlRequest, {
      headers: {
        "Content-Type": "application/xml",
      },
      responseType: "text",
      timeout: 60000,
    });

    return NextResponse.json({
      success: true,
      paymentHtml: response.data,
      orderId: body.merchantOrderId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("KuveytTürk initiate error:", message);
    return NextResponse.json(
      {
        error: "KuveytTürk ödeme başlatılamadı",
        message,
      },
      { status: 500 },
    );
  }
}
