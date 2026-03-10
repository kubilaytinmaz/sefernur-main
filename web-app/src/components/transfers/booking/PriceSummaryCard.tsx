/**
 * PriceSummaryCard Component
 * Fiyat özeti ve detaylarını gösteren kart bileşeni
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import type { PriceBreakdown } from "@/types/booking";
import { ChevronDown, ChevronUp, Percent, Tag } from "lucide-react";
import { useState } from "react";

interface PriceSummaryCardProps {
  price: PriceBreakdown;
  passengerCount: number;
  tourName?: string;
}

export function PriceSummaryCard({ price, passengerCount, tourName }: PriceSummaryCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const hasDiscount = price.couponDiscount > 0 || price.earlyBirdDiscount > 0;

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Fiyat Özeti</h3>
          </div>
          {hasDiscount && (
            <Badge className="bg-red-100 text-red-700 border-0 gap-1">
              <Percent className="w-3 h-3" />
              İndirimli
            </Badge>
          )}
        </div>

        {/* Price Items */}
        <div className="space-y-3 mb-4">
          {/* Transfer Price */}
          <div className="flex items-center justify-between py-2 border-b border-emerald-100">
            <div>
              <p className="text-sm font-medium text-slate-800">Transfer Ücreti</p>
              <p className="text-xs text-slate-500">
                {passengerCount} yolcu • Araç kapasitesi
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {formatTlUsdPairFromTl(price.transferTotal)}
            </p>
          </div>

          {/* Tour Price */}
          {price.tourPrice > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-emerald-100">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Tur Ücreti
                  {tourName && <span className="text-xs text-slate-500 ml-1">({tourName})</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {price.tourPricePerPerson > 0
                    ? `${formatTlUsdPairFromTl(price.tourPricePerPerson)} / kişi`
                    : "Sabit fiyat"}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {formatTlUsdPairFromTl(price.tourPrice)}
              </p>
            </div>
          )}

          {/* Discounts */}
          {hasDiscount && (
            <div className="space-y-2 py-2 bg-red-50 rounded-lg px-3">
              {price.earlyBirdDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700">Erken Rezervasyon İndirimi</span>
                  <span className="font-semibold text-red-700">
                    -{formatTlUsdPairFromTl(price.earlyBirdDiscount)}
                  </span>
                </div>
              )}
              {price.couponDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700">Kupon İndirimi</span>
                  <span className="font-semibold text-red-700">
                    -{formatTlUsdPairFromTl(price.couponDiscount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Subtotal */}
          {hasDiscount && (
            <div className="flex items-center justify-between py-2 border-b border-emerald-100">
              <span className="text-sm text-slate-600">Ara Toplam</span>
              <span className="text-sm font-medium text-slate-700">
                {formatTlUsdPairFromTl(price.subtotal)}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Toplam Fiyat</p>
              <p className="text-xs text-slate-400">
                {passengerCount} yolcu için • {price.currency}
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {formatTlUsdPairFromTl(price.total)}
            </p>
          </div>
        </div>

        {/* Breakdown Toggle */}
        {price.breakdown.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 transition-colors py-2"
            >
              {showBreakdown ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Detayları Gizle
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Fiyat Detayları
                </>
              )}
            </button>

            {showBreakdown && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
                {price.breakdown.map((item, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Önemli:</strong> Fiyatlar tahmini olup, rezervasyon onayı sonrası kesinleşecektir.
            Gece transferleri (22:00-06:00) için ek ücret uygulanabilir.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
