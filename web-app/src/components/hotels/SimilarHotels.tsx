"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTlUsdPairFromUsd } from "@/lib/currency";
import { getCityFallbackImage } from "@/lib/hotels/city-images";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";

/* ────────── Types ────────── */

export interface SimilarHotel {
  id: string;
  name: string;
  address: string;
  stars: number;
  price: number;
  image?: string;
  rating?: number;
  distanceText?: string;
}

interface SimilarHotelsProps {
  hotels: SimilarHotel[];
  cityCode: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  currentHotelId: string;
}

/* ────────── Helpers ────────── */

function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = d2.getTime() - d1.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function getHotelImageUrl(hotel: SimilarHotel, cityCode: number): string {
  if (hotel.image && hotel.image.startsWith("http")) {
    return hotel.image;
  }
  return getCityFallbackImage(cityCode, hotel.id);
}

/* ────────── Sub-Components ────────── */

interface SimilarHotelCardProps {
  hotel: SimilarHotel;
  cityCode: number;
  checkIn: string;
  checkOut: string;
  adults: number;
}

function SimilarHotelCard({ hotel, cityCode, checkIn, checkOut, adults }: SimilarHotelCardProps) {
  const nightCount = calculateNights(checkIn, checkOut);
  const imageUrl = getHotelImageUrl(hotel, cityCode);
  const perNightPrice = nightCount > 0 ? hotel.price / nightCount : hotel.price;

  const detailHref = `/hotels/${encodeURIComponent(hotel.id)}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}&cityCode=${cityCode}&hotelName=${encodeURIComponent(hotel.name)}&hotelAddress=${encodeURIComponent(hotel.address)}&image=${encodeURIComponent(imageUrl)}&stars=${hotel.stars}`;

  return (
    <Link href={detailHref} className="group">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
        {/* Image */}
        <div className="relative h-32 bg-slate-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = getCityFallbackImage(cityCode, hotel.id);
            }}
          />
          {hotel.stars > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="warning" className="text-xs px-2 py-0.5 shadow-sm">
                <Star className="w-3 h-3 fill-amber-500 mr-1" />
                {hotel.stars}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
            {hotel.name}
          </h4>

          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500 truncate">{hotel.address}</p>
          </div>

          {hotel.distanceText && (
            <p className="text-xs text-emerald-600 mt-1">{hotel.distanceText} uzaklıkta</p>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500">{nightCount} gece toplam</p>
              <p className="text-sm font-bold text-emerald-700">{formatTlUsdPairFromUsd(hotel.price)}</p>
            </div>
            {nightCount > 1 && (
              <p className="text-xs text-slate-500">{formatTlUsdPairFromUsd(perNightPrice)}/gece</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ────────── Main Component ────────── */

export function SimilarHotels({
  hotels,
  cityCode,
  checkIn,
  checkOut,
  adults,
  currentHotelId,
}: SimilarHotelsProps) {
  // Filter out current hotel and limit to 6
  const filteredHotels = hotels.filter((h) => h.id !== currentHotelId).slice(0, 6);

  if (filteredHotels.length === 0) {
    return null;
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Benzer Oteller</CardTitle>
        <p className="text-sm text-slate-500">Aynı bölgedeki diğer otel seçenekleri</p>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHotels.map((hotel) => (
            <SimilarHotelCard
              key={hotel.id}
              hotel={hotel}
              cityCode={cityCode}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={adults}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <Link
            href={`/hotels?cityCode=${cityCode}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Tüm otelleri gör
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
