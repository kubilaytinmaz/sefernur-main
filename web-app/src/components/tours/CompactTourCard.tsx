/**
 * CompactTourCard - Modern Compact Card for Tours
 * 
 * Smaller tour card for grid layout with glassmorphism effects
 * and smooth hover animations.
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
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  Moon,
  Sparkles,
  Star,
  Users,
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
  const sefernurNote = getSefernurNote(tour);

  return (
    <Link
      href={getTourUrl(tour.slug)}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className="group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-full min-h-[340px] md:min-h-[380px] rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/15">
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

        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            {/* External Link Badge */}
            <Badge className="bg-emerald-600/90 backdrop-blur-md text-white border-0 text-[10px] gap-1 shadow-md">
              UmreDunyasi
              <ExternalLink className="w-2.5 h-2.5" />
            </Badge>

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

        {/* Nights Badge - Floating */}
        {totalNights > 0 && (
          <div className="absolute top-3 right-3 mt-14">
            <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 text-[10px] gap-1 shadow-lg">
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
          <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2 leading-snug tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-emerald-300 group-hover:to-teal-300 transition-all">
            {tour.title}
          </h3>

          {/* Firm Info */}
          {tour.firm && (
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3 h-3 text-emerald-300" />
              <p className="text-xs text-emerald-100">{tour.firm.name}</p>
              {tour.firm.isVerified && (
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-white/70 line-clamp-2 mb-3 leading-relaxed min-h-[2.5em]">
            {tour.description || "Tur detayları için tıklayın."}
          </p>

          {/* Info Row */}
          <div className="flex items-center gap-3 mb-3 text-xs text-white/60">
            {tour.startDate && (
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-emerald-300" />
                {formatShortDate(tour.startDate)}
              </div>
            )}
            {tour.hotelStars && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {tour.hotelStars}★
              </span>
            )}
          </div>

          {/* Sefernur Note - Compact */}
          {sefernurNote && (
            <div className="mb-3 p-2 bg-emerald-950/50 backdrop-blur-md rounded-lg border border-emerald-500/20">
              <p className="text-[10px] text-emerald-200 leading-tight line-clamp-1">
                <strong className="text-emerald-300">Not:</strong> {sefernurNote}
              </p>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-end justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-[9px] text-emerald-300 uppercase tracking-wider mb-0.5">
                Başlangıç
              </p>
              <p className="text-lg font-bold text-white leading-tight">
                {formatTlUsdPairFromTl(Number(tour.price))}
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
