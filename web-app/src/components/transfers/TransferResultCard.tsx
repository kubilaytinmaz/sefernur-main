// Transfer Sonuç Kartı - Arama sonuçları için araç kartı
// TL ve USD fiyat gösterimi, detaylı bilgiler

"use client";

import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlSarPair, sarToTry } from "@/lib/currency";
import { getRouteFixedPrice } from "@/lib/transfers/pricing";
import { createSlug } from "@/lib/transfers/seo-slugs";
import { amenityLabels, TransferModel, vehicleTypeLabels } from "@/types/transfer";
import {
    Briefcase,
    Bus,
    Car,
    Clock,
    Shield,
    Star,
    Users,
    Wifi,
    Wind
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface TransferResultCardProps {
  transfer: TransferModel;
  routeId?: string;
  passengerCount: number;
  pickupTime: string;
  isNightTime?: boolean;
}

export function TransferResultCard({
  transfer,
  routeId,
  passengerCount,
  pickupTime,
  isNightTime = false,
}: TransferResultCardProps) {
  const firstImage = transfer.images?.[0];
  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;

  // Fiyat hesaplama
  const priceInfo = useMemo(() => {
    let basePrice = transfer.basePrice;
    
    // Rota bazlı fiyat varsa kullan
    if (routeId) {
      const routePrice = getRouteFixedPrice(routeId, transfer.vehicleType);
      if (routePrice) {
        basePrice = routePrice;
      }
    }

    // Gece sürşarjı hesapla
    const nightSurcharge = isNightTime ? Math.round(basePrice * 0.2) : 0;
    const totalPrice = basePrice + nightSurcharge;

    return {
      basePrice,
      nightSurcharge,
      totalPrice,
      priceTl: sarToTry(totalPrice),
    };
  }, [transfer, routeId, isNightTime]);

  // Araç ikonu
  const VehicleIcon = transfer.vehicleType === 'bus' || transfer.vehicleType === 'coster' ? Bus : Car;

  // SEO uyumlu URL
  const vehicleName = transfer.vehicleName || vehicleLabel;
  const vehicleSlug = `${createSlug(vehicleName)}-${transfer.id}`;
  
  // Booking URL - rota bilgisi ile
  const bookingUrl = routeId 
    ? `/transfer-rezervasyon/${vehicleSlug}/rota?routeId=${routeId}&passengers=${passengerCount}&time=${pickupTime}`
    : `/transfer-rezervasyon/${vehicleSlug}/tursuz`;

  return (
    <Link href={bookingUrl}>
      <Card className="group overflow-hidden border-slate-200 bg-white hover:border-cyan-300 transition-all duration-200 cursor-pointer h-full hover:shadow-lg">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200">
          {firstImage ? (
            <img
              src={firstImage}
              alt={transfer.vehicleName || vehicleLabel}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 to-sky-50">
              <VehicleIcon className="w-16 h-16 text-cyan-300" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-1.5">
              {transfer.isPopular && (
                <Badge className="bg-amber-500 text-white border-0 text-xs gap-1">
                  <Star className="w-3 h-3 fill-white" /> Popüler
                </Badge>
              )}
              <Badge className="bg-white/90 text-slate-800 border-0 text-xs backdrop-blur-sm gap-1">
                <VehicleIcon className="w-3 h-3" />
                {vehicleLabel}
              </Badge>
            </div>

            {/* Favorite Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton
                itemId={transfer.id}
                itemType="transfer"
                title={transfer.vehicleName || vehicleLabel}
                imageUrl={firstImage}
                size="sm"
              />
            </div>
          </div>

          {/* Bottom badges */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <Badge className="bg-cyan-600 text-white border-0 text-xs gap-1">
              <Users className="w-3 h-3" /> {transfer.capacity} Kişi
            </Badge>
            {transfer.durationMinutes > 0 && (
              <Badge className="bg-white/90 text-slate-800 border-0 text-xs backdrop-blur-sm gap-1">
                <Clock className="w-3 h-3" /> {transfer.durationMinutes} dk
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Vehicle Title */}
          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-cyan-700 transition-colors">
            {transfer.vehicleName || vehicleLabel}
          </h3>

          {/* Company */}
          {transfer.company && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Briefcase className="w-3 h-3 text-slate-400" />
              {transfer.company}
            </div>
          )}

          {/* Amenities */}
          {transfer.amenities && transfer.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {transfer.amenities.slice(0, 4).map((amenity) => (
                <div key={amenity} className="flex items-center gap-1 text-xs text-slate-600">
                  {amenity === 'air_condition' && <Wind className="w-3 h-3 text-cyan-500" />}
                  {amenity === 'wifi' && <Wifi className="w-3 h-3 text-cyan-500" />}
                  {amenity === 'insurance' && <Shield className="w-3 h-3 text-cyan-500" />}
                  <span>{amenityLabels[amenity]}</span>
                </div>
              ))}
              {transfer.amenities.length > 4 && (
                <span className="text-xs text-slate-400">+{transfer.amenities.length - 4}</span>
              )}
            </div>
          )}

          {/* Info Row */}
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {transfer.capacity} Yolcu
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-slate-400" />
              {transfer.luggageCapacity} Bagaj
            </div>
          </div>

          {/* Rating + Price Row */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
            <div className="flex items-center gap-1">
              {transfer.rating > 0 ? (
                <>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {transfer.rating.toFixed(1)}
                  </span>
                  {transfer.reviewCount > 0 && (
                    <span className="text-xs text-slate-400">({transfer.reviewCount})</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-400">Yeni</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Toplam Fiyat
              </p>
              <p className="text-lg font-bold text-cyan-700 leading-tight">
                {formatTlSarPair(priceInfo.priceTl, priceInfo.totalPrice)}
              </p>
              {isNightTime && priceInfo.nightSurcharge > 0 && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Gece sürşarjı dahil
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
