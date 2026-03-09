import {
    build3DApprovalXml,
    getKuveytTurkConfig,
    isKuveytTurkConfigReady,
    parseAuthResponse,
    parseProvisionResponse,
} from "@/lib/payment/kuveytturk";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

function buildResultRedirect(
  request: NextRequest,
  status: "success" | "failed",
  orderId: string,
  message: string,
  responseCode?: string,
) {
  const origin = request.headers.get("origin") || new URL(request.url).origin;
  const url = new URL(`${origin}/payment/kuveytturk/result`);
  url.searchParams.set("status", status);
  if (orderId) {
    url.searchParams.set("orderId", orderId);
  }
  if (message) {
    url.searchParams.set("message", message);
  }
  if (responseCode) {
    url.searchParams.set("responseCode", responseCode);
  }

  return NextResponse.redirect(url);
}

async function completePayment(
  merchantOrderId: string,
  amount: number,
  md: string,
): Promise<{ success: boolean; responseCode: string; responseMessage: string }> {
  const config = getKuveytTurkConfig();
  if (!isKuveytTurkConfigReady(config)) {
    return {
      success: false,
      responseCode: "CONFIG_ERROR",
      responseMessage: "KuveytTürk yapılandırması eksik",
    };
  }

  const xmlRequest = build3DApprovalXml(config, merchantOrderId, amount, md);

  const response = await axios.post(`${config.baseUrl}/ThreeDModelProvisionGate`, xmlRequest, {
    headers: {
      "Content-Type": "application/xml",
    },
    responseType: "text",
    timeout: 60000,
  });

  return parseProvisionResponse(response.data);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authResponseRaw = String(formData.get("AuthenticationResponse") || "");

    if (!authResponseRaw) {
      return buildResultRedirect(request, "failed", "", "AuthenticationResponse bulunamadı", "AUTH_MISSING");
    }

    const auth = parseAuthResponse(authResponseRaw);
    const merchantOrderId = auth.merchantOrderId || "";

    if (auth.responseCode !== "00" || !auth.md || !merchantOrderId || !auth.amount) {
      return buildResultRedirect(
        request,
        "failed",
        merchantOrderId,
        auth.responseMessage || "3D doğrulama başarısız",
        auth.responseCode || "AUTH_FAILED",
      );
    }

    const provisionResult = await completePayment(merchantOrderId, auth.amount, auth.md);
    if (!provisionResult.success) {
      return buildResultRedirect(
        request,
        "failed",
        merchantOrderId,
        provisionResult.responseMessage || "Provizyon başarısız",
        provisionResult.responseCode,
      );
    }

    return buildResultRedirect(
      request,
      "success",
      merchantOrderId,
      "Ödeme başarıyla tamamlandı",
      provisionResult.responseCode,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("KuveytTürk callback error:", message);
    return buildResultRedirect(request, "failed", "", "Ödeme callback işlemi başarısız", "CALLBACK_ERROR");
  }
}

export async function GET(request: NextRequest) {
  return buildResultRedirect(request, "failed", "", "Geçersiz ödeme callback isteği", "INVALID_CALLBACK");
}
