"use client";

import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatTlUsdPairFromUsd } from "@/lib/currency";
import { formatHotelAddress } from "@/lib/hotels/address-formatter";
import { Building2, ChevronLeft, ChevronRight, MapPin, Star, Utensils } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ────────── Constants ────────── */

// SVG placeholder for hotels without images
const HOTEL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%230ea5e9;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='800' height='600'/%3E%3Crect fill='%23f1f5f9' x='250' y='150' width='300' height='300' rx='8'/%3E%3Cpath fill='%2394a3b8' d='M350 220h100v80h-100z'/%3E%3Cpath fill='%2394a3b8' d='M360 240h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Cpath fill='%2394a3b8' d='M360 270h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Ctext fill='%2364748b' font-family='system-ui,-apple-system,sans-serif' font-size='20' font-weight='500' x='400' y='360' text-anchor='middle'%3EOtel Resmi%3C/text%3E%3Ctext fill='%2394a3b8' font-family='system-ui,-apple-system,sans-serif' font-size='14' x='400' y='385' text-anchor='middle'%3EMevcut Değil%3C/text%3E%3C/svg%3E";

/* ────────── Types ────────── */

export interface HotelCardData {
  id: string;
  name: string;
  address: string;
  cityName?: string;
  price: number;
  stars: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  amenities?: string[];
  distance?: number; // km (Harem'e/Mescid-i Nebevi'ye uzaklık)
  distanceText?: string; // "2.5 km" formatında
  holySiteName?: string; // "Kabe" veya "Mescid-i Nebevi"
  boardBasis?: string; // Kahvaltı dahil mi?
}

interface HotelCardProps {
  hotel: HotelCardData;
  checkIn: string;
  checkOut: string;
  adults: number;
  cityCode: number;
  viewMode?: "grid" | "list";
  showDistance?: boolean;
  totalGuests?: number; // Total guests for per-person pricing
}

/* ────────── Helper Functions ────────── */

function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = d2.getTime() - d1.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function getHotelImageUrl(hotel: HotelCardData): string {
  // Eğer image prop'u varsa ve geçerli bir URL ise kullan (http, data:, veya yerel /images/ yolu)
  if (hotel.image && (hotel.image.startsWith("http") || hotel.image.startsWith("data:") || hotel.image.startsWith("/"))) {
    return hotel.image;
  }
  
  // Fallback: SVG placeholder
  return HOTEL_PLACEHOLDER;
}

function getDefaultImage(): string {
  return HOTEL_PLACEHOLDER;
}

function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ────────── Grid View Card ────────── */

function GridCard({
  hotel,
  checkIn,
  checkOut,
  adults,
  cityCode,
  showDistance,
  totalGuests,
}: Omit<HotelCardProps, "viewMode">) {
  const nightCount = calculateNights(checkIn, checkOut);
  const imageUrl = getHotelImageUrl(hotel);
  const perNightPrice = nightCount > 0 ? hotel.price / nightCount : hotel.price;
  
  // Adresi formatla - Türkçe bölge isimleriyle
  const formattedAddress = formatHotelAddress(hotel.address, cityCode);
  
  // Generate 3 images for the gallery (use same image for all if only one available)
  const hotelImages = [
    imageUrl,
    imageUrl,
    imageUrl,
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Don't include placeholder SVG in URL - let detail page use its own placeholder
  const isPlaceholder = imageUrl === HOTEL_PLACEHOLDER || imageUrl.startsWith("data:image/svg");
  const imageParam = isPlaceholder ? "" : `&image=${encodeURIComponent(imageUrl)}`;
  const detailHref = `/hotels/${encodeURIComponent(hotel.id)}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}&cityCode=${cityCode}&hotelName=${encodeURIComponent(hotel.name)}&hotelAddress=${encodeURIComponent(hotel.address)}${imageParam}&stars=${hotel.stars}`;

  return (
    <Card className="group overflow-hidden border-slate-200 bg-white hover:border-emerald-300 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer">
      {/* Image Gallery */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <Link href={detailHref} className="block w-full h-full">
          <img
            src={hotelImages[currentImageIndex]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = HOTEL_PLACEHOLDER;
            }}
          />
        </Link>
        
        {/* Navigation Arrows - Outside Link */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentImageIndex((prev) => (prev === 0 ? 2 : prev - 1));
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentImageIndex((prev) => (prev === 2 ? 0 : prev + 1));
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {/* Image Indicators - Outside Link */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImageIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
            
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          <div className="flex flex-wrap gap-1.5">
            {hotel.stars > 0 && (
              <Badge className="bg-amber-500 text-white border-0 text-xs font-semibold shadow-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                {hotel.stars}
              </Badge>
            )}
            {hotel.boardBasis && (
              <Badge className="bg-emerald-500 text-white border-0 text-xs font-medium shadow-md flex items-center gap-1">
                <Utensils className="w-3 h-3" />
                {hotel.boardBasis}
              </Badge>
            )}
          </div>
           
          {/* Favorite Button */}
          <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto">
            <FavoriteButton
              itemId={hotel.id}
              itemType="hotel"
              title={hotel.name}
              imageUrl={imageUrl}
              size="sm"
            />
          </div>
        </div>
      </div>
        
      {/* Content */}
      <Link href={detailHref} className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <h3 className="font-semibold text-slate-900 text-base line-clamp-2 group-hover:text-emerald-700 transition-colors min-h-[48px]">
            {capitalizeFirstLetter(hotel.name)}
          </h3>
          
          {/* Distance Badge (taşındı) */}
          {showDistance && hotel.distanceText && hotel.holySiteName && (
            <div className="mt-2">
              <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium">
                <MapPin className="w-3 h-3 mr-1" />
                {hotel.holySiteName}'e {hotel.distanceText}
              </Badge>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span className="line-clamp-1" title={formattedAddress.fullAddress}>
              {formattedAddress.displayAddress}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-0 mt-auto">
          {/* Rating */}
          {hotel.rating !== undefined && hotel.rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-slate-700">
                  {hotel.rating.toFixed(1)}
                </span>
              </div>
              {hotel.reviewCount !== undefined && hotel.reviewCount > 0 && (
                <span className="text-xs text-slate-400">
                  ({hotel.reviewCount} değerlendirme)
                </span>
              )}
            </div>
          )}

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md"
                >
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-xs text-slate-400 px-1">
                  +{hotel.amenities.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  {nightCount} gece toplam • {totalGuests || 2} kişi
                </p>
                <p className="text-xl font-bold text-emerald-700">
                  {formatTlUsdPairFromUsd(hotel.price)}
                </p>
                {totalGuests && totalGuests > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kişi başı {formatTlUsdPairFromUsd(hotel.price / totalGuests)}
                  </p>
                )}
               </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = detailHref;
                }}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                Detaylar
              </button>
            </div>
          </div>
        </CardContent>
        </Link>
    </Card>
  );
}

/* ────────── List View Card ────────── */

function ListCard({
  hotel,
  checkIn,
  checkOut,
  adults,
  cityCode,
  showDistance,
  totalGuests,
}: Omit<HotelCardProps, "viewMode">) {
  const nightCount = calculateNights(checkIn, checkOut);
  const imageUrl = getHotelImageUrl(hotel);
  const perNightPrice = nightCount > 0 ? hotel.price / nightCount : hotel.price;
  
  // Adresi formatla - Türkçe bölge isimleriyle
  const formattedAddress = formatHotelAddress(hotel.address, cityCode);
  
  // Don't include placeholder SVG in URL - let detail page use its own placeholder
  const isPlaceholder = imageUrl === HOTEL_PLACEHOLDER || imageUrl.startsWith("data:image/svg");
  const imageParam = isPlaceholder ? "" : `&image=${encodeURIComponent(imageUrl)}`;
  const detailHref = `/hotels/${encodeURIComponent(hotel.id)}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}&cityCode=${cityCode}&hotelName=${encodeURIComponent(hotel.name)}&hotelAddress=${encodeURIComponent(hotel.address)}${imageParam}&stars=${hotel.stars}`;

  return (
    <Card className="group overflow-hidden border-slate-200 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
      <Link href={detailHref}>
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden bg-slate-100">
            <img
              src={imageUrl}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = HOTEL_PLACEHOLDER;
              }}
            />
             
            {/* Favorite Button */}
            <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
              <FavoriteButton
                itemId={hotel.id}
                itemType="hotel"
                title={hotel.name}
                imageUrl={imageUrl}
                size="sm"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors mb-1">
                  {capitalizeFirstLetter(hotel.name)}
                </h3>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {hotel.stars > 0 && (
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {hotel.stars} Yıldız
                    </Badge>
                  )}
                  {hotel.boardBasis && (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      {hotel.boardBasis}
                    </Badge>
                  )}
                  {showDistance && hotel.distanceText && hotel.holySiteName && (
                    <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hotel.holySiteName}'e {hotel.distanceText}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span title={formattedAddress.fullAddress}>{formattedAddress.displayAddress}</span>
                </div>
              </div>
              
               {/* Price */}
               <div className="text-right shrink-0">
                 <p className="text-xs font-semibold text-slate-600 mb-1">
                   {nightCount} gece • {totalGuests || 2} kişi
                 </p>
                 <p className="text-2xl font-bold text-emerald-700">
                   {formatTlUsdPairFromUsd(hotel.price)}
                 </p>
                 {totalGuests && totalGuests > 0 && (
                   <p className="text-xs text-slate-500 mt-0.5">
                     Kişi başı {formatTlUsdPairFromUsd(hotel.price / totalGuests)}
                   </p>
                 )}
                 <button
                   onClick={(e) => {
                     e.preventDefault();
                     window.location.href = detailHref;
                   }}
                   className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                 >
                   Detaylar
                 </button>
               </div>
            </div>

            {/* Rating & Amenities */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
              {hotel.rating !== undefined && hotel.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    {hotel.rating.toFixed(1)}
                  </span>
                  {hotel.reviewCount !== undefined && hotel.reviewCount > 0 && (
                    <span className="text-xs text-slate-400">
                      ({hotel.reviewCount})
                    </span>
                  )}
                </div>
              )}
              
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{hotel.amenities.slice(0, 3).join(" • ")}</span>
                  {hotel.amenities.length > 3 && (
                    <span className="text-slate-400">+{hotel.amenities.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}

/* ────────── Main Component ────────── */

export function HotelCard(props: HotelCardProps) {
  const viewMode = props.viewMode || "grid";
  
  if (viewMode === "list") {
    return <ListCard {...props} />;
  }
  
  return <GridCard {...props} />;
}
