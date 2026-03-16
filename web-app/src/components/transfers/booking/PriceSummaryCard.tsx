/**
 * PriceSummaryCard Component
 * Sadece toplam tur ücretini gösteren kart bileşeni
 */

"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import type { PriceBreakdown } from "@/types/booking";

interface PriceSummaryCardProps {
  price: PriceBreakdown;
  passengerCount: number;
  tourName?: string;
  tourCount?: number; // Çoklu tur sayısı
}

export function PriceSummaryCard({ price, passengerCount, tourName, tourCount }: PriceSummaryCardProps) {
  // Fiyat hesaplanmamışsa kartı gösterme
  if (price.tourPrice <= 0) {
    return null;
  }

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Toplam Tur Ücreti</h3>
        </div>

        {/* Total */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">
                {tourCount && tourCount > 1 ? `${tourCount} tur` : "1 tur"} • {passengerCount} kişi
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {formatTlUsdPairFromTl(price.tourPrice)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
