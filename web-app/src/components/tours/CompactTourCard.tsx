/**
 * CompactTourCard - Clean, Minimal Tour Card
 *
 * Sadeleştirilmiş tur kartı: Başlık, fiyat, süre ve gece bilgisi.
 * Gereksiz açıklama, firma adı, not ve tarih bilgileri kaldırıldı.
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { formatTlUsdPairFromTl, formatTlUsdPairFromUsd } from "@/lib/currency";
import { getTotalNights, getTourUrl } from "@/lib/umredunyasi";
import {
  Building2,
  Clock3,
  ExternalLink,
  Moon,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CompactTourCardProps {
  tour: any;
  index?: number;
}

export function CompactTourCard({ tour, index = 0 }: CompactTourCardProps) {
  const firstImage = tour.images?.[0];
  const totalNights = getTotalNights(tour);

  return (
    <Link
      href={getTourUrl(tour.slug)}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className="group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-full min-h-[280px] md:min-h-[320px] rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/15">
        {/* Background Image */}
        {firstImage ? (
          <Image
            src={firstImage}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 transition-all duration-500" />

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            {/* Duration Badge */}
            <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-0 text-[10px] gap-1 shadow-md">
              <Clock3 className="w-2.5 h-2.5" />
              {tour.duration} Gün
            </Badge>
          </div>

          {/* Popular Badge */}
          {tour.isPopular && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              Popüler
            </Badge>
          )}
        </div>

        {/* Nights Badge */}
        {totalNights > 0 && (
          <div className="absolute top-12 left-3">
            <Badge className="bg-emerald-600/80 backdrop-blur-md text-white border-0 text-[10px] gap-1 shadow-md">
              <Moon className="w-2.5 h-2.5" />
              {tour.makkahNights ? `Mekke ${tour.makkahNights}` : ""}
              {tour.makkahNights && tour.madinahNights ? " · " : ""}
              {tour.madinahNights ? `Medine ${tour.madinahNights}` : ""}
            </Badge>
          </div>
        )}

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Title */}
          <h3 className="text-base md:text-lg font-bold text-white mb-3 line-clamp-2 leading-snug tracking-tight group-hover:text-emerald-200 transition-colors duration-300">
            {tour.title}
          </h3>

          {/* Price & CTA */}
          <div className="flex items-end justify-between pt-2 border-t border-white/15">
            <div>
              <p className="text-[9px] text-emerald-300/80 uppercase tracking-wider mb-0.5">
                Başlangıç
              </p>
              <p className="text-lg font-bold text-white leading-tight">
                {tour.priceCurrency === "USD" || tour.currency === "USD"
                  ? formatTlUsdPairFromUsd(Number(tour.price))
                  : formatTlUsdPairFromTl(Number(tour.price))}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-2xl transition-shadow duration-500 group-hover:shadow-[0_8px_40px_-8px_rgba(16,185,129,0.3)]" />
      </div>
    </Link>
  );
}
