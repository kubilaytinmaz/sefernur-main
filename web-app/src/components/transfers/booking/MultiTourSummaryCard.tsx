/**
 * MultiTourSummaryCard Component
 * Çoklu tur seçiminde tüm turları kompakt şekilde gösteren bileşen
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import type { PopularService } from "@/lib/transfers/popular-services-simple";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Info,
    MapPin,
    Plus,
    X
} from "lucide-react";
import { useMemo, useState } from "react";

interface MultiTourSummaryCardProps {
  tours: PopularService[];
  onRemoveTour?: (tourId: string) => void;
  onAddTour?: () => void;
  onShowTourDetail?: (tour: PopularService) => void;
  passengerCount?: number;
}

export function MultiTourSummaryCard({
  tours,
  onRemoveTour,
  onAddTour,
  onShowTourDetail,
  passengerCount = 1,
}: MultiTourSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Toplam tur fiyatını hesapla
  const totalTourPrice = useMemo(() => {
    return tours.reduce((sum, tour) => {
      if (tour.price.type === "per_person") {
        return sum + tour.price.baseAmount * passengerCount;
      }
      return sum + tour.price.baseAmount;
    }, 0);
  }, [tours, passengerCount]);

  // Toplam süre
  const totalHours = useMemo(() => {
    return tours.reduce((sum, tour) => sum + tour.duration.hours, 0);
  }, [tours]);

  // Toplam mesafe
  const totalKm = useMemo(() => {
    return tours.reduce((sum, tour) => sum + (tour.distance?.km || 0), 0);
  }, [tours]);

  if (tours.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-xl">
              🎫
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Seçili Turlar ({tours.length})
              </h3>
              <p className="text-xs text-slate-600">
                {totalHours} saat • {totalKm > 0 ? `${totalKm} km` : "Çoklu lokasyon"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-orange-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-orange-600" />
            )}
          </button>
        </div>

        {/* Tours List */}
        {isExpanded && (
          <div className="space-y-3 mb-4">
            {tours.map((tour, index) => (
              <TourItem
                key={tour.id}
                tour={tour}
                index={index}
                passengerCount={passengerCount}
                onRemove={onRemoveTour}
                onShowDetail={onShowTourDetail}
              />
            ))}
          </div>
        )}

        {/* Add Tour Button */}
        {onAddTour && isExpanded && (
          <button
            type="button"
            onClick={onAddTour}
            className="w-full py-3 px-4 border-2 border-dashed border-orange-300 rounded-lg text-orange-700 hover:bg-orange-100 hover:border-orange-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tur Ekle
          </button>
        )}

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Toplam Tur Ücreti</p>
              <p className="text-xs text-slate-500">
                {tours.length} tur • {passengerCount} kişi
              </p>
            </div>
            <p className="text-xl font-bold text-orange-700">
              {formatTlUsdPairFromTl(totalTourPrice)}
            </p>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-3 p-3 bg-white/50 rounded-lg border border-orange-200">
          <p className="text-xs text-slate-600">
            <Info className="w-3 h-3 inline mr-1" />
            Tur tarihleri rezervasyon sonrası koordine edilecektir.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────── Tek Tur Item ────────── */

interface TourItemProps {
  tour: PopularService;
  index: number;
  passengerCount: number;
  onRemove?: (tourId: string) => void;
  onShowDetail?: (tour: PopularService) => void;
}

function TourItem({
  tour,
  index,
  passengerCount,
  onRemove,
  onShowDetail,
}: TourItemProps) {
  const tourPrice = useMemo(() => {
    if (tour.price.type === "per_person") {
      return tour.price.baseAmount * passengerCount;
    }
    return tour.price.baseAmount;
  }, [tour, passengerCount]);

  return (
    <div
      className={cn(
        "bg-white rounded-lg p-3 border-2 border-orange-200 transition-all",
        "hover:border-orange-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Index Badge */}
        <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          {index + 1}
        </div>

        {/* Icon */}
        <div className="text-2xl shrink-0">{tour.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {tour.name}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {tour.description}
              </p>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(tour.id)}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                aria-label="Turu kaldır"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="w-3 h-3 text-orange-600" />
              {tour.duration.text}
            </div>
            {tour.distance && (
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <MapPin className="w-3 h-3 text-orange-600" />
                {tour.distance.text}
              </div>
            )}
            {tour.isPopular && (
              <Badge className="bg-amber-500 text-white border-0 text-[10px]">
                Popüler
              </Badge>
            )}
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Tur Fiyatı</p>
              <p className="text-sm font-bold text-orange-700">
                {formatTlUsdPairFromTl(tourPrice)}
                {tour.price.type === "per_person" && (
                  <span className="text-xs font-normal text-slate-500"> / kişi</span>
                )}
              </p>
            </div>
            {onShowDetail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShowDetail(tour)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
              >
                <Info className="w-3.5 h-3.5 mr-1" />
                Detay
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
