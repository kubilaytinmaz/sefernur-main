"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTlUsdPairFromTl, formatTlUsdPairFromUsd } from "@/lib/currency";
import type {
  HotelBasicInfo,
  HotelSearchParams,
  SelectedRoomInfo,
} from "@/types/hotel-booking";
import { calculateNights } from "@/types/hotel-booking";
import {
  BedDouble,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Star,
  Users,
  XCircle
} from "lucide-react";

interface BookingSummaryCardProps {
  hotel: HotelBasicInfo;
  searchParams: HotelSearchParams;
  selectedRoom: SelectedRoomInfo | null;
  showTrustBadges?: boolean;
  showPriceBreakdown?: boolean;
}

export function BookingSummaryCard({
  hotel,
  searchParams,
  selectedRoom,
  showTrustBadges = true,
  showPriceBreakdown = true,
}: BookingSummaryCardProps) {
  const nightCount = calculateNights(
    searchParams.checkIn,
    searchParams.checkOut
  );

  return (
    <Card className="border-slate-200 bg-white shadow-lg shadow-slate-200/50 sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-900">
          Rezervasyon Özeti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hotel Info */}
        <div className="flex gap-3">
          {hotel.hotelImage && (
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200">
              <img
                src={hotel.hotelImage}
                alt={hotel.hotelName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
              {hotel.hotelName}
            </h3>
            {hotel.stars > 0 && (
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < hotel.stars
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}
            {hotel.address && (
              <div className="flex items-start gap-1 mt-1.5 text-xs text-slate-500">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{hotel.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Giriş</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(searchParams.checkIn)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Çıkış</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(searchParams.checkOut)}
            </p>
          </div>
        </div>

        {/* Duration & Guests */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{nightCount} gece</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{searchParams.adults} yetişkin</span>
          </div>
        </div>

        {/* Selected Room */}
        {selectedRoom && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">Seçilen Oda</p>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {translateRoomName(selectedRoom.roomName)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">
                    {translateBoardBasis(selectedRoom.boardBasis)}
                  </Badge>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{nightCount} gece</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {selectedRoom.currency === "USD"
                      ? formatTlUsdPairFromUsd(selectedRoom.price)
                      : formatTlUsdPairFromTl(selectedRoom.price)}
                  </p>
                </div>
              </div>

              {/* Refundable badge */}
              <div className="mt-2 pt-2 border-t border-emerald-200/60">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    selectedRoom.refundable
                      ? "text-emerald-600"
                      : "text-orange-600"
                  }`}
                >
                  {selectedRoom.refundable ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {selectedRoom.refundable
                    ? "Ücretsiz iptal"
                    : "İade kısıtlı"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {showPriceBreakdown && selectedRoom && (
          <div className="pt-3 border-t border-slate-100">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Oda ({nightCount} gece)
                </span>
                <span className="text-slate-900 font-medium">
                  {selectedRoom.currency === "USD"
                    ? formatTlUsdPairFromUsd(selectedRoom.price)
                    : formatTlUsdPairFromTl(selectedRoom.price)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-900">Toplam</span>
                <span className="font-bold text-lg text-emerald-700">
                  {selectedRoom.currency === "USD"
                    ? formatTlUsdPairFromUsd(selectedRoom.price)
                    : formatTlUsdPairFromTl(selectedRoom.price)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        {showTrustBadges && (
          <div className="pt-3 border-t border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Güvenli SSL ödeme</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>KuveytTürk 3D Secure</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function translateRoomName(roomName: string): string {
  const translations: Record<string, string> = {
    "Quadruple Room": "Dört Kişilik Oda",
    "Triple Room": "Üç Yataklı Oda",
    "Double Room": "Çift Kişilik Oda",
    "Twin Room": "İki Yataklı Oda",
    "Single Room": "Tek Kişilik Oda",
    "Standard Room": "Standart Oda",
    "Deluxe Room": "Deluxe Oda",
    "Superior Room": "Superior Oda",
    "Executive Room": "Executive Oda",
    "Family Room": "Aile Odası",
    "Suite": "Suite",
    "Junior Suite": "Junior Suite",
  };
  return translations[roomName] || roomName;
}

function translateBoardBasis(boardBasis: string): string {
  const translations: Record<string, string> = {
    "Room Only": "Sadece Oda",
    "Bed and Breakfast": "Kahvaltı Dahil",
    "Half Board": "Yarım Pansiyon",
    "Full Board": "Tam Pansiyon",
    "All Inclusive": "Her Şey Dahil",
    "Ultra All Inclusive": "Ultra Her Şey Dahil",
    "Self Catering": "Kendi Yemeğini Kendin Yap",
  };
  return translations[boardBasis] || boardBasis;
}
