"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { finalizeReservationPayment } from "@/lib/firebase/reservations";
import { useAuthStore } from "@/store/auth";
import { CheckCircle2, CircleX, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function KuveytTurkPaymentResultContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const status = searchParams.get("status") || "failed";
  const orderId = searchParams.get("orderId") || "";
  const message = searchParams.get("message") || "Ödeme işlemi tamamlanamadı";
  const responseCode = searchParams.get("responseCode") || "";

  const [updateInfo, setUpdateInfo] = useState<string | null>(null);
  const isSuccess = useMemo(() => status === "success", [status]);

  useEffect(() => {
    const updateReservation = async () => {
      if (!isAuthenticated || !orderId) return;

      const result = await finalizeReservationPayment(
        orderId,
        isSuccess,
        responseCode,
        message,
      );

      setUpdateInfo(
        result.message ||
          (result.updated
            ? "Rezervasyon durumu güncellendi."
            : "Rezervasyon kaydı bulunamadı."),
      );
    };

    updateReservation();
  }, [isAuthenticated, isSuccess, message, orderId, responseCode]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              {isSuccess ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <CircleX className="w-8 h-8 text-red-600" />
              )}
              <div>
                <CardTitle className={isSuccess ? "text-emerald-700" : "text-red-700"}>
                  {isSuccess ? "Ödeme Başarılı" : "Ödeme Başarısız"}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Ödeme sonucu bankadan alınan bilgiye göre işlendi.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Durum</p>
                <p className="font-semibold mt-1">{isSuccess ? "Başarılı" : "Başarısız"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Sipariş No</p>
                <p className="font-semibold mt-1">{orderId || "-"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Banka Kod</p>
                <p className="font-semibold mt-1">{responseCode || "-"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Mesaj</p>
                <p className="font-semibold mt-1 line-clamp-2">{message}</p>
              </div>
            </div>

            {updateInfo ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                {updateInfo}
              </div>
            ) : null}

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-700 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <p className="font-semibold">Sonraki adım</p>
              </div>
              <p className="text-slate-600">
                Rezervasyon ve ödeme durumunuzu “Rezervasyonlarım” ekranından takip edebilirsiniz.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button onClick={() => window.location.assign("/reservations")}>Rezervasyonlarım</Button>
              <Button variant="outline" onClick={() => window.location.assign("/hotels")}>Otele Dön</Button>
              <Button variant="ghost" onClick={() => window.location.assign("/")}>Ana Sayfa</Button>
            </div>

            {!isAuthenticated ? (
              <Badge variant="warning" className="inline-flex items-center gap-1">
                <ReceiptText className="w-3.5 h-3.5" />
                Rezervasyon takibi için giriş yapın.
                <Link href="/auth" className="underline ml-1">Giriş</Link>
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function KuveytTurkPaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-10">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="py-10 text-center text-sm text-slate-600">
                Ödeme sonucu yükleniyor...
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <KuveytTurkPaymentResultContent />
    </Suspense>
  );
}
