/**
 * FeaturedTourCard - Modern Hero Card for Tours
 * 
 * Large, featured tour card with glassmorphism effects,
 * holographic shimmer, and floating elements.
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import {
  formatShortDate,
  getSefernurNote,
  getTotalNights,
  getTourUrl,
} from "@/lib/umredunyasi";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Moon,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FeaturedTourCardProps {
  tour: any;
  index?: number;
}

export function FeaturedTourCard({ tour, index = 0 }: FeaturedTourCardProps) {
  const firstImage = tour.images?.[0];
  const totalNights = getTotalNights(tour);
  const sefernurNote = getSefernurNote(tour);

  return (
    <Link
      href={getTourUrl(tour.slug)}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-full min-h-[420px] md:min-h-[480px] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-900/20">
        {/* Background Image */}
        {firstImage ? (
          <Image
            src={firstImage}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600" />
        )}

        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-pattern-featured" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M50 30 L70 50 L50 70 L30 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern-featured)" className="text-white" />
          </svg>
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {/* External Link Badge */}
            <Badge className="bg-emerald-600/90 backdrop-blur-md text-white border-0 text-xs gap-1.5 shadow-lg">
              UmreDunyasi
              <ExternalLink className="w-3 h-3" />
            </Badge>

            {/* Duration Badge */}
            <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-0 text-xs gap-1.5 shadow-lg">
              <Clock3 className="w-3 h-3" />
              {tour.duration} Gün
            </Badge>
          </div>

          {/* Popular Badge */}
          {tour.isPopular && (
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 blur-lg opacity-50 animate-pulse" />
              <Badge className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs gap-1.5 shadow-lg">
                <Sparkles className="w-3 h-3" />
                Popüler
              </Badge>
            </div>
          )}
        </div>

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
          {/* Nights Badge - Floating */}
          {totalNights > 0 && (
            <div className="absolute -top-16 left-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full" />
                <Badge className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 text-xs gap-1.5 px-4 py-2 shadow-xl">
                  <Moon className="w-3.5 h-3.5" />
                  {tour.makkahNights ? `Mekke ${tour.makkahNights}` : ""}
                  {tour.makkahNights && tour.madinahNights ? " · " : ""}
                  {tour.madinahNights ? `Medine ${tour.madinahNights}` : ""}
                  {" "}Gece
                </Badge>
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-2 leading-tight tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-emerald-300 group-hover:to-teal-300 transition-all">
            {tour.title}
          </h3>

          {/* Firm Info */}
          {tour.firm && (
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-emerald-300" />
              <p className="text-sm text-emerald-100">{tour.firm.name}</p>
              {tour.firm.isVerified && (
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-white/80 line-clamp-2 mb-4 leading-relaxed">
            {tour.description || "Tur detayları için tıklayın."}
          </p>

          {/* Info Row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-white/70">
            {tour.startDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-emerald-300" />
                {formatShortDate(tour.startDate)}
              </div>
            )}
            {tour.hotelStars && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {tour.hotelStars} Yıldız
              </span>
            )}
          </div>

          {/* Sefernur Note */}
          {sefernurNote && (
            <div className="mb-4 p-3 bg-emerald-950/50 backdrop-blur-md rounded-xl border border-emerald-500/30">
              <p className="text-xs text-emerald-200 leading-relaxed">
                <strong className="text-emerald-300">Sefernur Notu:</strong> {sefernurNote}
              </p>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">
                Başlangıç Fiyatı
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {formatTlUsdPairFromTl(Number(tour.price))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-300 group-hover:text-emerald-200 transition-colors">
                Detaylı Bilgi
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-emerald-500/50 transition-all">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-3xl transition-shadow duration-500 group-hover:shadow-[0_8px_60px_-8px_rgba(16,185,129,0.4)]" />
      </div>
    </Link>
  );
}
